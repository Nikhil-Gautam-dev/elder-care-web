import { ObjectId } from 'mongodb';
import {
  buildMedication,
  describeMedication,
  medicationSupplyStatus,
  mergeMedication,
  validateMedicationInput,
  type AuthContext,
  type DaySlot,
  MEDICATION_FORMS,
  type FoodTiming,
  type MedicationForm,
} from '@eldercare/shared';
import {
  getDoseLogsCollection,
  getMedicationsCollection,
  type MedicationDoc,
  type UserDoc,
} from '../config/db.js';
import { authorize, fail, isFailure, type ToolResult } from './result.js';
import { compact, matchForText } from '../pharmacy/match.js';

type Authorized = Exclude<Awaited<ReturnType<typeof authorize>>, ToolResult>;

const possessive = (name: string) => (name.endsWith('s') ? `${name}'` : `${name}'s`);

/** Resolves the person and requires permission to change/order their medicines. */
export async function authorizeManage(
  person: string | undefined,
  auth: AuthContext | undefined,
): Promise<ToolResult | Authorized> {
  const resolved = await authorize(person, auth, 'self-or-family');
  if (isFailure(resolved)) return resolved;
  if (!resolved.canManageOrders) {
    return fail(
      `You don't have permission to manage ${possessive(resolved.targetUser.name)} medicines.`,
    );
  }
  return resolved;
}

const normalise = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

/** Finds one of an elder's saved medicines by (part of) its name. Never exposes ids to the model. */
export async function findMedication(
  elder: UserDoc,
  query: string,
  { includeStopped = false } = {},
): Promise<{ match: MedicationDoc } | { failure: ToolResult }> {
  const meds = await getMedicationsCollection()
    .find({ elderId: elder._id, ...(includeStopped ? {} : { active: true }) })
    .toArray();

  const q = normalise(query);
  const label = (m: MedicationDoc) => `${m.name} ${m.strength}`;
  const stages = [
    meds.filter((m) => normalise(m.name) === q || normalise(label(m)) === q),
    meds.filter((m) => normalise(m.genericName ?? '') === q),
    meds.filter(
      (m) => normalise(label(m)).includes(q) || normalise(m.genericName ?? '').includes(q),
    ),
  ];

  for (const found of stages) {
    if (found.length === 1) return { match: found[0]! };
    if (found.length > 1) {
      return {
        failure: {
          success: false,
          ambiguous: true,
          candidates: found.map((m) => ({ medicine: label(m) })),
          error: `More than one saved medicine matches '${query}'. Ask which one.`,
        },
      };
    }
  }
  return {
    failure: fail(
      `${possessive(elder.name)} saved medicines don't include anything like '${query}'.`,
    ),
  };
}

const view = (m: MedicationDoc) => {
  const status = medicationSupplyStatus(m);
  return {
    medicine: `${m.name} ${m.strength}`,
    genericName: m.genericName,
    form: m.form,
    howToTake: describeMedication(m),
    unitsOnHand: status.unitsLeft,
    daysOfSupplyLeft: status.daysLeft,
    runningLow: status.needsRefill,
    prescribedBy: m.prescribedBy,
    stopped: m.active ? undefined : true,
  };
};

export async function listMedications(
  person: string | undefined,
  includeStopped: boolean,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorize(person, auth, 'self-or-family');
  if (isFailure(resolved)) return resolved;

  const meds = await getMedicationsCollection()
    .find({ elderId: resolved.targetUser._id, ...(includeStopped ? {} : { active: true }) })
    .sort({ active: -1, name: 1 })
    .toArray();

  const history = await doseHistory(meds);

  return {
    success: true,
    forName: resolved.isSelf ? 'you' : resolved.targetUser.name,
    count: meds.length,
    medicines: meds.map((m) => ({ ...view(m), ...history.get(m._id.toString()) })),
    youCanChangeThese: resolved.canManageOrders,
  };
}

const IST = 'Asia/Kolkata';
const istDay = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: IST });

/** "today at 8:15 am" / "yesterday at 9:00 pm" / "3 Oct at 8:00 am" (India time). */
function describeWhen(taken: Date, now: Date): string {
  const time = taken
    .toLocaleTimeString('en-IN', {
      timeZone: IST,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase();
  const day = istDay(taken);
  if (day === istDay(now)) return `today at ${time}`;
  if (day === istDay(new Date(now.getTime() - 24 * 60 * 60 * 1000))) return `yesterday at ${time}`;
  const date = taken.toLocaleDateString('en-IN', { timeZone: IST, day: 'numeric', month: 'short' });
  return `${date} at ${time}`;
}

/** Per medicine: doses logged today (India time) and when the last one was taken. Undone doses don't count. */
async function doseHistory(meds: MedicationDoc[]) {
  const out = new Map<string, { dosesTakenToday: number; lastTaken: string }>();
  if (!meds.length) return out;
  const now = new Date();
  const today = istDay(now);

  const logs = await getDoseLogsCollection()
    .find({ medicationId: { $in: meds.map((m) => m._id) }, undoneAt: { $exists: false } })
    .sort({ takenAt: -1 })
    .limit(500)
    .toArray();

  for (const log of logs) {
    const key = log.medicationId.toString();
    const entry = out.get(key) ?? { dosesTakenToday: 0, lastTaken: describeWhen(log.takenAt, now) };
    if (istDay(log.takenAt) === today) entry.dosesTakenToday += 1;
    out.set(key, entry);
  }
  return out;
}

export interface MedicationArgs {
  name?: string;
  genericName?: string;
  strength?: string;
  form?: MedicationForm;
  doseAmount?: number;
  doseUnit?: string;
  slots?: DaySlot[];
  times?: string[];
  food?: FoodTiming;
  asNeeded?: boolean;
  instructions?: string;
  unitsPerPack?: number;
  unitsOnHand?: number;
  refillAtDays?: number;
  prescribedBy?: string;
}

const DEFAULT_UNIT: Record<MedicationForm, string> = {
  tablet: 'tablet',
  capsule: 'capsule',
  syrup: 'ml',
  injection: 'injection',
  drops: 'drop',
  inhaler: 'puff',
  ointment: 'application',
  other: 'unit',
};

const dropUndefined = <T extends Record<string, unknown>>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;

/** Flat tool arguments → the nested shape the shared validator expects. */
function toInput(a: MedicationArgs, mode: 'create' | 'update') {
  const dose = dropUndefined({
    amount: a.doseAmount,
    unit: a.doseUnit ?? (mode === 'create' && a.form ? DEFAULT_UNIT[a.form] : undefined),
  });
  const schedule = dropUndefined({
    slots: a.slots,
    times: a.times,
    food: a.food,
    asNeeded: a.asNeeded,
    instructions: a.instructions,
  });
  const supply = dropUndefined({
    unitsPerPack: a.unitsPerPack,
    unitsRemaining: a.unitsOnHand,
    refillThresholdDays: a.refillAtDays,
  });
  return dropUndefined({
    name: a.name,
    genericName: a.genericName,
    strength: a.strength,
    form: a.form,
    prescribedBy: a.prescribedBy,
    dose: mode === 'create' || Object.keys(dose).length ? dose : undefined,
    schedule: mode === 'create' || Object.keys(schedule).length ? schedule : undefined,
    supply: mode === 'create' || Object.keys(supply).length ? supply : undefined,
  });
}

/** Fills strength, type, generic name and pack size from the pharmacy catalog when the brand is known. */
async function autofillFromCatalog(args: MedicationArgs): Promise<MedicationArgs> {
  if (!args.name || (args.strength && args.form && args.unitsPerPack)) return args;
  try {
    const match = await matchForText(`${args.name} ${args.strength ?? ''}`.trim());
    if (!('item' in match)) return args;
    const c = match.item;
    const form = (MEDICATION_FORMS as readonly string[]).includes(c.form)
      ? (c.form as MedicationForm)
      : undefined;
    return {
      ...args,
      name: compact(args.name).startsWith(compact(c.brand)) ? c.brand : args.name,
      genericName: args.genericName ?? c.generic,
      strength: args.strength ?? c.strength,
      form: args.form ?? form,
      unitsPerPack: args.unitsPerPack ?? c.packSize,
    };
  } catch {
    return args; // pharmacy unreachable: continue with what we were given
  }
}

export async function addMedication(
  person: string | undefined,
  rawArgs: MedicationArgs,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorizeManage(person, auth);
  if (isFailure(resolved)) return resolved;

  const args = await autofillFromCatalog(rawArgs);
  const missing = [
    !args.strength && 'strength',
    !args.form && 'type (tablet, syrup…)',
    args.doseAmount === undefined && 'how much is taken each time',
    !args.slots?.length && !args.times?.length && !args.asNeeded && 'when it is taken',
    !args.unitsPerPack && 'how many are in one pack',
  ].filter(Boolean);
  if (missing.length) {
    return {
      success: false,
      error: `Still needed before saving: ${missing.join(', ')}. Ask the user only for these.`,
      understood: dropUndefined({
        name: args.name,
        strength: args.strength,
        form: args.form,
        unitsPerPack: args.unitsPerPack,
      }),
    };
  }

  const parsed = validateMedicationInput(toInput(args, 'create'), 'create');
  if (!parsed.ok) return fail(parsed.error);

  const meds = getMedicationsCollection();
  const fields = buildMedication(parsed.value);
  const duplicate = await meds.findOne({
    elderId: resolved.targetUser._id,
    active: true,
    name: fields.name,
    strength: fields.strength,
  });
  if (duplicate) {
    return fail(`${fields.name} ${fields.strength} is already saved. Use an update to change it.`);
  }

  const now = new Date();
  const doc: MedicationDoc = {
    _id: new ObjectId(),
    elderId: resolved.targetUser._id,
    ...fields,
    createdBy: resolved.callerUser._id,
    createdAt: now,
    updatedAt: now,
  };
  await meds.insertOne(doc);

  return { success: true, saved: view(doc) };
}

export async function updateMedication(
  person: string | undefined,
  medication: string,
  args: MedicationArgs,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorizeManage(person, auth);
  if (isFailure(resolved)) return resolved;

  const found = await findMedication(resolved.targetUser, medication);
  if ('failure' in found) return found.failure;

  const input = toInput(args, 'update');
  if (Object.keys(input).length === 0) return fail('Nothing to change was given.');
  const parsed = validateMedicationInput(input, 'update');
  if (!parsed.ok) return fail(parsed.error);

  const now = new Date();
  const merged = mergeMedication(found.match, parsed.value, now);
  if (!merged.ok) return fail(merged.error);

  const { _id, ...fields } = merged.value;
  await getMedicationsCollection().updateOne(
    { _id },
    { $set: dropUndefined({ ...fields, updatedAt: now }) },
  );

  return { success: true, saved: view({ ...merged.value, updatedAt: now }) };
}

/** Records a dose as taken and reduces the units on hand. */
export async function logDose(
  person: string | undefined,
  medication: string,
  amount: number | undefined,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorizeManage(person, auth);
  if (isFailure(resolved)) return resolved;

  const found = await findMedication(resolved.targetUser, medication);
  if ('failure' in found) return found.failure;
  const med = found.match;

  const taken = amount ?? med.dose.amount;
  if (!Number.isFinite(taken) || taken <= 0 || taken > 100) {
    return fail('The amount taken must be more than 0.');
  }

  const now = new Date();
  const updated = await getMedicationsCollection().findOneAndUpdate(
    { _id: med._id, 'supply.unitsRemaining': { $gte: taken } },
    { $inc: { 'supply.unitsRemaining': -taken }, $set: { updatedAt: now } },
    { returnDocument: 'after' },
  );
  if (!updated) {
    return fail(
      `Only ${medicationSupplyStatus(med).unitsLeft} ${med.dose.unit} of ${med.name} are recorded as left, so that dose can't be logged. If the count is wrong, update how many they have.`,
    );
  }
  await getDoseLogsCollection().insertOne({
    _id: new ObjectId(),
    medicationId: med._id,
    elderId: med.elderId,
    amount: taken,
    takenAt: now,
    loggedBy: resolved.callerUser._id,
  });

  return { success: true, taken: `${taken} ${med.dose.unit}`, now: view(updated) };
}

/** Reverses the most recent logged dose of a medicine (a mistaken "taken"). */
export async function undoLastDose(
  person: string | undefined,
  medication: string,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorizeManage(person, auth);
  if (isFailure(resolved)) return resolved;

  const found = await findMedication(resolved.targetUser, medication);
  if ('failure' in found) return found.failure;

  const now = new Date();
  const last = await getDoseLogsCollection().findOneAndUpdate(
    { medicationId: found.match._id, undoneAt: { $exists: false } },
    { $set: { undoneAt: now, undoneBy: resolved.callerUser._id } },
    { sort: { takenAt: -1 }, returnDocument: 'after' },
  );
  if (!last) return fail(`There is no logged dose of ${found.match.name} to undo.`);

  const updated = await getMedicationsCollection().findOneAndUpdate(
    { _id: found.match._id },
    { $inc: { 'supply.unitsRemaining': last.amount }, $set: { updatedAt: now } },
    { returnDocument: 'after' },
  );
  return {
    success: true,
    undone: `${last.amount} ${found.match.dose.unit}`,
    now: view(updated ?? found.match),
  };
}

export async function stopMedication(
  person: string | undefined,
  medication: string,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorizeManage(person, auth);
  if (isFailure(resolved)) return resolved;

  const found = await findMedication(resolved.targetUser, medication);
  if ('failure' in found) return found.failure;

  const now = new Date();
  await getMedicationsCollection().updateOne(
    { _id: found.match._id },
    { $set: { active: false, endDate: found.match.endDate ?? now, updatedAt: now } },
  );
  return { success: true, stopped: `${found.match.name} ${found.match.strength}` };
}
