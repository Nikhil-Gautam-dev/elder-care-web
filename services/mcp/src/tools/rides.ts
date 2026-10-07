import { ObjectId } from 'mongodb';
import {
  CANCELLABLE_RIDE_STATUSES,
  FINAL_RIDE_STATUSES,
  formatAddress,
  formatIndianPhone,
  normalizeIndianPhone,
  type AuthContext,
  type RideStatus,
} from '@eldercare/shared';
import {
  getNotificationsCollection,
  getRideDraftsCollection,
  getRidesCollection,
  getUsersCollection,
  type RideDoc,
  type RideDraftDoc,
} from '../config/db.js';
import { loadFamilyContext } from '../data/family.js';
import { resolveTargetUserAndAuth } from '../data/resolver.js';
import {
  cancelRide as cancelRidesRide,
  createRide,
  estimateFare,
  getRide as getRidesRide,
  RidesError,
} from '../rides/client.js';
import { authorize, fail, isFailure, type ToolResult } from './result.js';

const DRAFT_TTL_MS = 15 * 60 * 1000;
const MAX_ADVANCE_MS = 90 * 24 * 60 * 60 * 1000;
const PAST_GRACE_MS = 60 * 1000;
const IST = 'Asia/Kolkata';

const STATUS_TEXT: Record<RideStatus, string> = {
  requested: 'requested, waiting for a driver to accept it',
  accepted: 'accepted, a driver has been assigned',
  arriving: 'the driver is on the way to the pickup',
  in_progress: 'the trip is under way',
  completed: 'completed',
  rejected: 'could not be arranged (rejected)',
  cancelled: 'cancelled',
};

/** Turns ride service failures into something the assistant can say; unexpected errors bubble up. */
function ridesFail(err: unknown): ToolResult {
  if (err instanceof RidesError) {
    return { success: false, error: err.message, ...(err.status === 409 ? err.details : {}) };
  }
  throw err;
}

const possessive = (name: string) => (name.endsWith('s') ? `${name}'` : `${name}'s`);

/** Resolves the person and requires permission to book or cancel rides for them. */
async function authorizeRides(person: string | undefined, auth: AuthContext | undefined) {
  const resolved = await authorize(person, auth, 'self-or-family');
  if (isFailure(resolved)) return resolved;
  if (!resolved.canManageRides) {
    return fail(`You don't have permission to book rides for ${resolved.targetUser.name}.`);
  }
  return resolved;
}

const whenText = (date: Date | null): string =>
  date
    ? date.toLocaleString('en-IN', {
        timeZone: IST,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'as soon as possible';

/** "now"/empty -> null (as soon as possible). Times without an offset are India time. */
function parseWhen(value: string | undefined): { at: Date | null } | { error: string } {
  const text = value?.trim();
  if (!text || text.toLowerCase() === 'now') return { at: null };
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/i.test(text);
  const at = new Date(hasZone ? text : `${text}+05:30`);
  if (Number.isNaN(at.getTime())) {
    return { error: 'The pickup time was not understood. Ask the user for a clear date and time.' };
  }
  if (at.getTime() < Date.now() - PAST_GRACE_MS) {
    return { error: 'That pickup time is in the past. Ask the user for a later time.' };
  }
  if (at.getTime() > Date.now() + MAX_ADVANCE_MS) {
    return { error: 'Rides can only be booked up to 90 days ahead.' };
  }
  return { at };
}

/** "RD-000003" -> "3": short enough to say aloud. */
const spokenRideNumber = (rideNumber: string): string =>
  String(Number.parseInt(rideNumber.replace(/\D/g, ''), 10) || rideNumber);

/** Accepts "3", "RD-3", "rd 000003" and "RD-000003" and returns the stored form. */
const storedRideNumber = (input: string): string => {
  const digits = input.replace(/\D/g, '');
  return digits ? `RD-${digits.padStart(6, '0')}` : input.trim().toUpperCase();
};

const rupees = (amount: number) => `₹${amount}`;

export interface PrepareRideArgs {
  pickup?: string;
  drop?: string;
  when?: string;
  notes?: string;
}

/**
 * Step 1 of booking: validates the trip and stores it as a short-lived draft.
 * Nothing is sent to the ride service until `book_ride` is called with the draft id.
 */
export async function prepareRide(
  person: string | undefined,
  args: PrepareRideArgs,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorizeRides(person, auth);
  if (isFailure(resolved)) return resolved;

  const elder = resolved.targetUser;
  const who = resolved.isSelf ? 'Your' : `${possessive(elder.name)}`;

  const drop = args.drop?.trim();
  if (!drop) return fail('Ask the user where the ride should go.');

  let pickup = args.pickup?.trim();
  if (!pickup) {
    pickup = formatAddress(elder.address);
    if (!elder.address?.line1?.trim() || !pickup) {
      return fail(
        `No pickup place was given and ${who} saved address is missing. Ask where to be picked up${
          resolved.isSelf ? ' (the home address can be saved with set_address)' : ''
        }.`,
      );
    }
  }
  if (pickup.length > 300 || drop.length > 300) {
    return fail('An address is too long. Ask for a shorter one.');
  }

  const phone = normalizeIndianPhone(elder.phone);
  if (!phone)
    return fail(`${elder.name} has no valid mobile number saved, which the driver needs.`);

  const when = parseWhen(args.when);
  if ('error' in when) return fail(when.error);

  let fare;
  try {
    fare = await estimateFare({ address: pickup }, { address: drop });
  } catch (err) {
    return ridesFail(err);
  }

  const now = new Date();
  const notes = args.notes?.trim().slice(0, 300) || undefined;
  const draft: RideDraftDoc = {
    _id: new ObjectId(),
    callerId: resolved.callerUser._id,
    elderId: elder._id,
    pickup,
    drop,
    scheduledAt: when.at,
    ...(notes ? { notes } : {}),
    fareEstimate: fare.fareEstimate,
    rider: { name: elder.name, phone },
    used: false,
    createdAt: now,
    expiresAt: new Date(now.getTime() + DRAFT_TTL_MS),
  };
  await getRideDraftsCollection().insertOne(draft);

  const active = await getRidesCollection().findOne({
    elderId: elder._id,
    status: { $in: ['requested', 'accepted', 'arriving', 'in_progress'] },
  });

  return {
    success: true,
    draftId: draft._id.toString(),
    rideFor: resolved.isSelf ? 'you' : elder.name,
    pickup,
    drop,
    pickupTime: whenText(draft.scheduledAt),
    notes,
    estimatedFare: rupees(fare.fareEstimate),
    fareNote: 'An estimate, paid to the driver.',
    contactNumber: formatIndianPhone(phone),
    validForMinutes: DRAFT_TTL_MS / 60000,
    ...(active
      ? {
          warning: `There is already an active ride (number ${spokenRideNumber(active.rideNumber)}). Mention this and check they really want another.`,
        }
      : {}),
    next: 'Read this back to the user. Only call book_ride with draftId after a clear yes.',
  };
}

/** Step 2: books exactly the confirmed draft and tells the family. Safe to repeat. */
export async function bookRide(draftId: string, auth?: AuthContext): Promise<ToolResult> {
  const resolvedCaller = await authorize('me', auth, 'self-only');
  if (isFailure(resolvedCaller)) return resolvedCaller;
  const caller = resolvedCaller.callerUser;

  const drafts = getRideDraftsCollection();
  const draft = ObjectId.isValid(draftId)
    ? await drafts.findOne({ _id: new ObjectId(draftId) })
    : null;
  if (!draft) {
    return fail('That ride summary has expired or does not exist. Prepare the ride again first.');
  }
  if (!draft.callerId.equals(caller._id)) return fail('That ride summary belongs to someone else.');

  // A repeated confirmation returns the ride already booked from this draft instead of a new one.
  const booked = await getRidesCollection().findOne({ draftId: draft._id });
  if (booked) return { ...bookedView(booked), alreadyBooked: true };
  if (draft.expiresAt < new Date()) {
    return fail('That ride summary has expired or does not exist. Prepare the ride again first.');
  }
  if (draft.used) return fail('That ride is already being booked. Check its status in a moment.');

  // Permission may have changed since the summary was prepared.
  const elder = await resolveTargetUserAndAuth(draft.elderId.toString(), auth);
  if (elder.error || !elder.targetUser || !elder.canManageRides) {
    return fail('You no longer have permission to book rides for this person.');
  }

  const claimed = await drafts.findOneAndUpdate(
    { _id: draft._id, used: false },
    { $set: { used: true } },
  );
  if (!claimed) return fail('That ride is already being booked. Check its status in a moment.');

  let created;
  try {
    created = await createRide({
      pickup: { address: draft.pickup },
      drop: { address: draft.drop },
      rider: draft.rider,
      scheduledAt: draft.scheduledAt ? draft.scheduledAt.toISOString() : null,
      ...(draft.notes ? { notes: draft.notes } : {}),
      requestId: draft._id.toString(),
      externalRef: { elderId: draft.elderId.toString(), bookedBy: caller._id.toString() },
    });
  } catch (err) {
    await drafts.updateOne({ _id: draft._id }, { $set: { used: false } });
    return ridesFail(err);
  }

  const now = new Date();
  const record: RideDoc = {
    _id: new ObjectId(),
    draftId: draft._id,
    ridesRideId: created.id,
    rideNumber: created.rideNumber,
    elderId: draft.elderId,
    bookedBy: caller._id,
    bookedByName: caller.name,
    pickup: draft.pickup,
    drop: draft.drop,
    scheduledAt: draft.scheduledAt,
    ...(draft.notes ? { notes: draft.notes } : {}),
    fareEstimate: created.fareEstimate,
    status: created.status as RideStatus,
    statusUpdatedAt: now,
    createdAt: now,
  };
  await getRidesCollection().insertOne(record);

  const message = `${
    elder.isSelf ? caller.name : `${caller.name} (for ${elder.targetUser.name})`
  } booked a ride from ${record.pickup} to ${record.drop}, ${whenText(record.scheduledAt)}. Estimated fare ${rupees(record.fareEstimate)}. Ride number ${spokenRideNumber(record.rideNumber)}.`;
  await notifyFamily(record, message, { includeBooker: false });

  return bookedView(record);
}

const bookedView = (r: RideDoc): ToolResult => ({
  success: true,
  rideNumber: spokenRideNumber(r.rideNumber),
  status: STATUS_TEXT[r.status],
  pickup: r.pickup,
  drop: r.drop,
  pickupTime: whenText(r.scheduledAt),
  estimatedFare: rupees(r.fareEstimate),
});

async function notifyFamily(
  ride: RideDoc,
  message: string,
  { includeBooker, sender }: { includeBooker: boolean; sender?: { id: ObjectId; name: string } },
): Promise<void> {
  const booker = await getUsersCollection().findOne({ _id: ride.bookedBy });
  const family = booker ? await loadFamilyContext(booker) : null;
  if (!family) return;

  const recipients = new Map<string, ObjectId>();
  for (const m of family.members) {
    if (m.isViewer && !includeBooker) continue;
    if (sender && m.user._id.equals(sender.id)) continue;
    if (m.member.canReceiveNotifications || m.user._id.equals(ride.elderId)) {
      recipients.set(m.user._id.toString(), m.user._id);
    }
  }
  if (recipients.size === 0) return;

  const now = new Date();
  await getNotificationsCollection().insertMany(
    [...recipients.values()].map((recipientId) => ({
      recipientId,
      senderId: sender?.id ?? ride.bookedBy,
      senderName: sender?.name ?? ride.bookedByName,
      aboutUserId: ride.elderId,
      message,
      read: false,
      createdAt: now,
    })),
  );
}

/** Tells the family once that a ride ended; the atomic flag keeps repeat lookups from duplicating it. */
async function notifyEnded(ride: RideDoc): Promise<void> {
  if (!FINAL_RIDE_STATUSES.includes(ride.status)) return;
  const claimed = await getRidesCollection().findOneAndUpdate(
    { _id: ride._id, endNotified: { $ne: true } },
    { $set: { endNotified: true } },
  );
  if (!claimed) return;

  const elder = await getUsersCollection().findOne({ _id: ride.elderId });
  const outcome =
    ride.status === 'completed'
      ? 'was completed'
      : ride.status === 'cancelled'
        ? `was cancelled${ride.cancelledByName ? ` by ${ride.cancelledByName}` : ''}`
        : `could not be arranged${ride.rejectionReason ? ` (${ride.rejectionReason})` : ''}`;
  const message = `The ride ${elder ? `for ${elder.name} ` : ''}from ${ride.pickup} to ${ride.drop} ${outcome}. Ride number ${spokenRideNumber(ride.rideNumber)}.`;
  const sender = ride.cancelledBy
    ? { id: ride.cancelledBy, name: ride.cancelledByName ?? 'Someone' }
    : undefined;
  await notifyFamily(ride, message, { includeBooker: true, sender });
}

/** Brings a stored ride up to date with the ride service (on demand). */
async function refresh(ride: RideDoc): Promise<RideDoc> {
  if (FINAL_RIDE_STATUSES.includes(ride.status)) {
    await notifyEnded(ride);
    return ride;
  }
  try {
    const latest = await getRidesRide(ride.ridesRideId);
    const status = latest.status as RideStatus;
    const driver = latest.driver
      ? { name: latest.driver.name, vehicle: latest.driver.vehicle, plate: latest.driver.plate }
      : undefined;
    const next: RideDoc = {
      ...ride,
      status,
      ...(driver ? { driver } : {}),
      ...(latest.rejectionReason ? { rejectionReason: latest.rejectionReason } : {}),
    };
    if (status !== ride.status || driver?.plate !== ride.driver?.plate) {
      next.statusUpdatedAt = new Date();
      await getRidesCollection().updateOne(
        { _id: ride._id },
        {
          $set: {
            status,
            statusUpdatedAt: next.statusUpdatedAt,
            ...(driver ? { driver } : {}),
            ...(latest.rejectionReason ? { rejectionReason: latest.rejectionReason } : {}),
          },
        },
      );
    }
    await notifyEnded(next);
    return next;
  } catch {
    return ride; // ride service unreachable: fall back to the last known status
  }
}

const rideView = (r: RideDoc, forName?: string) => ({
  rideNumber: spokenRideNumber(r.rideNumber),
  forPerson: forName,
  status: STATUS_TEXT[r.status],
  pickup: r.pickup,
  drop: r.drop,
  pickupTime: whenText(r.scheduledAt),
  estimatedFare: rupees(r.fareEstimate),
  driver: r.driver
    ? { name: r.driver.name, vehicle: r.driver.vehicle, numberPlate: r.driver.plate }
    : undefined,
  reason: r.rejectionReason,
  cancelledBy: r.cancelledByName,
  bookedBy: r.bookedByName,
  bookedAt: r.createdAt,
  lastUpdate: r.statusUpdatedAt,
});

async function findRides(
  person: string | undefined,
  rideNumber: string | undefined,
  limit: number,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorize(person, auth, 'self-or-family');
  if (isFailure(resolved)) return resolved;

  // Asking about yourself also covers rides you booked for someone else.
  const whose = resolved.isSelf
    ? { $or: [{ elderId: resolved.targetUser._id }, { bookedBy: resolved.callerUser._id }] }
    : { elderId: resolved.targetUser._id };
  const rides = await getRidesCollection()
    .find({ ...whose, ...(rideNumber ? { rideNumber: storedRideNumber(rideNumber) } : {}) })
    .sort({ createdAt: -1 })
    .limit(rideNumber ? 1 : limit)
    .toArray();

  if (rides.length === 0)
    return {
      success: true,
      count: 0,
      message: `No rides found for ${resolved.isSelf ? 'the user' : resolved.targetUser.name}. Rides that family members booked for themselves are not theirs.`,
    };

  const fresh = await Promise.all(rides.map(refresh));
  const people = await getUsersCollection()
    .find({ _id: { $in: fresh.map((r) => r.elderId) } })
    .toArray();
  const nameOf = (r: RideDoc) =>
    r.elderId.equals(resolved.targetUser._id) && resolved.isSelf
      ? 'you'
      : people.find((u) => u._id.equals(r.elderId))?.name;
  return { success: true, count: fresh.length, rides: fresh.map((r) => rideView(r, nameOf(r))) };
}

/** Status of the latest ride, or of one by number, with driver and vehicle once assigned. */
export const getRideStatus = (
  person: string | undefined,
  rideNumber: string | undefined,
  auth?: AuthContext,
) => findRides(person, rideNumber, 1, auth);

/** Recent rides for a person, newest first. */
export const listRides = (person: string | undefined, auth?: AuthContext) =>
  findRides(person, undefined, 5, auth);

export async function cancelRide(
  person: string | undefined,
  rideNumber: string | undefined,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorizeRides(person, auth);
  if (isFailure(resolved)) return resolved;

  const rides = getRidesCollection();
  const ride = await rides.findOne(
    {
      elderId: resolved.targetUser._id,
      ...(rideNumber
        ? { rideNumber: storedRideNumber(rideNumber) }
        : { status: { $in: [...CANCELLABLE_RIDE_STATUSES] } }),
    },
    { sort: { createdAt: -1 } },
  );
  if (!ride) {
    return fail(
      rideNumber
        ? `No ride ${rideNumber} found for ${resolved.targetUser.name}.`
        : `${resolved.targetUser.name} has no ride that can be cancelled.`,
    );
  }

  const current = await refresh(ride);
  if (current.status === 'cancelled') {
    return { success: true, message: 'That ride was already cancelled.' };
  }
  if (!CANCELLABLE_RIDE_STATUSES.includes(current.status)) {
    return fail(
      current.status === 'in_progress'
        ? 'That ride has already started, so it can no longer be cancelled.'
        : `That ride is already ${STATUS_TEXT[current.status]}, so it cannot be cancelled.`,
    );
  }

  try {
    await cancelRidesRide(ride.ridesRideId, `Cancelled by ${resolved.callerUser.name}`);
  } catch (err) {
    if (err instanceof RidesError && err.status === 409) {
      await refresh(current);
      return fail('That ride can no longer be cancelled because the trip has already started.');
    }
    return ridesFail(err);
  }

  const now = new Date();
  const cancelledBy = resolved.callerUser._id;
  const cancelledByName = resolved.callerUser.name;
  await rides.updateOne(
    { _id: ride._id },
    { $set: { status: 'cancelled', statusUpdatedAt: now, cancelledBy, cancelledByName } },
  );
  await notifyEnded({
    ...current,
    status: 'cancelled',
    statusUpdatedAt: now,
    cancelledBy,
    cancelledByName,
  });
  return { success: true, cancelled: spokenRideNumber(ride.rideNumber) };
}
