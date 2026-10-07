import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { createError } from '../middleware/errorHandler.js';
import { estimateFare } from '../lib/fare.js';
import { normalizeIndianPhone } from '../lib/phone.js';
import { parsePlace } from '../lib/place.js';
import {
  getDrivers,
  getRides,
  nextRideNumber,
  RIDE_STATUSES,
  type RideDoc,
  type RideStatus,
} from '../models/rides.model.js';

/** Allowed next statuses. Cancelling is only possible before the ride has started. */
const TRANSITIONS: Record<RideStatus, RideStatus[]> = {
  requested: ['accepted', 'rejected', 'cancelled'],
  accepted: ['arriving', 'cancelled'],
  arriving: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: [],
  rejected: [],
  cancelled: [],
};

const serialize = (ride: RideDoc) => ({
  ...ride,
  id: ride._id.toString(),
  _id: undefined,
  driver: ride.driver ? { ...ride.driver, id: ride.driver.id.toString() } : undefined,
});

function toObjectId(id: string | undefined): ObjectId {
  if (!id || !ObjectId.isValid(id)) throw createError(`Invalid ID: ${id ?? ''}`, 400);
  return new ObjectId(id);
}

/** Absent / null / "now" means as soon as possible (null); otherwise a valid, not-past date. */
function parseScheduledAt(value: unknown): Date | null {
  if (value === undefined || value === null || value === '' || value === 'now') return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw createError('scheduledAt must be an ISO date-time, "now" or omitted', 400);
  }
  if (date.getTime() < Date.now() - 5 * 60 * 1000) {
    throw createError('scheduledAt cannot be in the past', 400);
  }
  return date;
}

interface CreateRideBody {
  pickup?: { address?: string; lat?: number; lng?: number };
  drop?: { address?: string; lat?: number; lng?: number };
  rider?: { name?: string; phone?: string };
  scheduledAt?: string | null;
  notes?: string;
  externalRef?: Record<string, unknown>;
  requestId?: string;
}

/** Partner API: requests a ride. Idempotent on `requestId`. */
export async function createRide(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateRideBody;

  const pickup = parsePlace(body.pickup, 'pickup');
  const drop = parsePlace(body.drop, 'drop');
  const name = body.rider?.name?.trim();
  const phone = normalizeIndianPhone(String(body.rider?.phone ?? ''));
  if (!name) throw createError('rider.name is required', 400);
  if (!phone) throw createError('rider.phone must be a valid 10-digit Indian mobile number', 400);
  const scheduledAt = parseScheduledAt(body.scheduledAt);

  const requestId = body.requestId?.trim() || undefined;
  const rides = getRides();

  if (requestId) {
    const existing = await rides.findOne({ requestId });
    if (existing) {
      res.status(200).json({ success: true, idempotent: true, data: serialize(existing) });
      return;
    }
  }

  const now = new Date();
  const ride: RideDoc = {
    _id: new ObjectId(),
    rideNumber: await nextRideNumber(),
    pickup,
    drop,
    rider: { name, phone },
    scheduledAt,
    notes: body.notes?.trim() || undefined,
    fareEstimate: estimateFare(pickup, drop).fare,
    status: 'requested',
    statusHistory: [{ status: 'requested', at: now }],
    externalRef: body.externalRef
      ? Object.fromEntries(Object.entries(body.externalRef).map(([k, v]) => [k, String(v)]))
      : undefined,
    requestId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await rides.insertOne(ride);
  } catch (err) {
    // A concurrent request with the same requestId won the race.
    if ((err as { code?: number }).code === 11000 && requestId) {
      const existing = await rides.findOne({ requestId });
      if (existing) {
        res.status(200).json({ success: true, idempotent: true, data: serialize(existing) });
        return;
      }
    }
    throw err;
  }

  res.status(201).json({ success: true, data: serialize(ride) });
}

/** Fare estimate without creating a ride. */
export function fareEstimate(req: Request, res: Response): void {
  const body = req.body as Pick<CreateRideBody, 'pickup' | 'drop'>;
  const pickup = parsePlace(body.pickup, 'pickup');
  const drop = parsePlace(body.drop, 'drop');
  const { fare, distanceKm } = estimateFare(pickup, drop);
  res.json({
    success: true,
    data: {
      fareEstimate: fare,
      currency: 'INR',
      distanceKm,
      basis: distanceKm === undefined ? 'flat' : 'distance',
    },
  });
}

export async function getRide(req: Request, res: Response): Promise<void> {
  const idParam = req.params['id'];
  const ride = idParam?.startsWith('RD-')
    ? await getRides().findOne({ rideNumber: idParam })
    : await getRides().findOne({ _id: toObjectId(idParam) });
  if (!ride) throw createError('Ride not found', 404);
  res.json({ success: true, data: serialize(ride) });
}

/**
 * Filters: `status` (comma separated), `riderPhone`, `ref.<key>=value` (matches the caller's
 * externalRef), `limit`, `page`.
 */
export async function listRides(req: Request, res: Response): Promise<void> {
  const filter: Record<string, unknown> = {};

  const status = String(req.query['status'] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (status.length) {
    const invalid = status.filter((s) => !RIDE_STATUSES.includes(s as RideStatus));
    if (invalid.length) throw createError(`Unknown status: ${invalid.join(', ')}`, 400);
    filter['status'] = { $in: status };
  }

  if (req.query['riderPhone']) {
    const phone = normalizeIndianPhone(String(req.query['riderPhone']));
    if (!phone) throw createError('riderPhone must be a valid 10-digit Indian mobile number', 400);
    filter['rider.phone'] = phone;
  }

  for (const [key, value] of Object.entries(req.query)) {
    if (key.startsWith('ref.') && typeof value === 'string' && /^[\w-]+$/.test(key.slice(4))) {
      filter[`externalRef.${key.slice(4)}`] = value;
    }
  }

  const limit = Math.min(100, Math.max(1, Number(req.query['limit'] ?? 50)));
  const page = Math.max(1, Number(req.query['page'] ?? 1));

  const rides = getRides();
  const [items, total] = await Promise.all([
    rides
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    rides.countDocuments(filter),
  ]);

  res.json({ success: true, data: { items: items.map(serialize), total, page, limit } });
}

/** Moves a ride to `status` if the transition is valid. `driverId` is required to accept. */
async function transition(
  id: string | undefined,
  status: RideStatus,
  options: { note?: string; reason?: string; driverId?: string },
): Promise<RideDoc> {
  const _id = toObjectId(id);
  const rides = getRides();
  const ride = await rides.findOne({ _id });
  if (!ride) throw createError('Ride not found', 404);

  if (!TRANSITIONS[ride.status].includes(status)) {
    throw createError(
      status === 'cancelled'
        ? `A ride that is ${ride.status} can no longer be cancelled`
        : `A ride that is ${ride.status} cannot become ${status}`,
      409,
    );
  }

  let driver: RideDoc['driver'];
  if (status === 'accepted') {
    if (!options.driverId) throw createError('driverId is required to accept a ride', 400);
    const found = await getDrivers().findOne({ _id: toObjectId(options.driverId) });
    if (!found) throw createError('Driver not found', 404);
    if (!found.active) throw createError(`${found.name} is not active`, 409);
    driver = { id: found._id, name: found.name, vehicle: found.vehicle, plate: found.plate };
  }

  const note = options.note?.trim();
  const now = new Date();
  const updated = await rides.findOneAndUpdate(
    { _id, status: ride.status },
    {
      $set: {
        status,
        updatedAt: now,
        ...(driver ? { driver } : {}),
        ...(status === 'rejected' ? { rejectionReason: options.reason!.trim() } : {}),
      },
      $push: { statusHistory: { status, at: now, ...(note ? { note } : {}) } },
    },
    { returnDocument: 'after' },
  );
  if (!updated) throw createError('The ride was changed by someone else — refresh and retry', 409);
  return updated;
}

/** Staff: moves a ride along the flow. */
export async function updateRideStatus(req: Request, res: Response): Promise<void> {
  const { status, note, reason, driverId } = req.body as {
    status?: RideStatus;
    note?: string;
    reason?: string;
    driverId?: string;
  };
  if (!status || !RIDE_STATUSES.includes(status)) {
    throw createError(`status must be one of ${RIDE_STATUSES.join(', ')}`, 400);
  }
  if (status === 'rejected' && !reason?.trim()) {
    throw createError('A reason is required when rejecting a ride', 400);
  }
  const updated = await transition(req.params['id'], status, { note, reason, driverId });
  res.json({ success: true, data: serialize(updated) });
}

/** Partner or staff: cancel before the ride starts. */
export async function cancelRide(req: Request, res: Response): Promise<void> {
  const { note } = (req.body ?? {}) as { note?: string };
  const updated = await transition(req.params['id'], 'cancelled', {
    note: note ?? (req.staff ? 'Cancelled by staff' : 'Cancelled by rider'),
  });
  res.json({ success: true, data: serialize(updated) });
}
