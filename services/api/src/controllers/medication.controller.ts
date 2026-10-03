import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  buildMedication,
  describeMedication,
  medicationSupplyStatus,
  mergeMedication,
  validateMedicationInput,
  type IDoseLog,
  type IMedicationView,
  type LogDoseBody,
  type MedicationFields,
} from '@eldercare/shared';
import { createError } from '../middleware/errorHandler.js';
import {
  getDoseLogsCollection,
  getFamiliesCollection,
  getMedicationsCollection,
  getPharmacyOrdersCollection,
  getUsersCollection,
  type DoseLogDoc,
  type MedicationDoc,
  type PharmacyOrderDoc,
} from '../models/user.model.js';

/** MongoDB would store `undefined` as null; leave such fields out instead. */
const withoutUndefined = <T extends object>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;

function toObjectId(id: string | undefined, label = 'ID'): ObjectId {
  if (!id || !ObjectId.isValid(id)) throw createError(`Invalid ${label}: ${id ?? ''}`, 400);
  return new ObjectId(id);
}

function requireCaller(req: Request): { id: ObjectId; isAdmin: boolean } {
  if (!req.user?.id) throw createError('Unauthorized', 401);
  return { id: new ObjectId(req.user.id), isAdmin: req.user.role === 'admin' };
}

interface Access {
  canView: boolean;
  /** Add / change / stop medicines and order them. */
  canManage: boolean;
}

/**
 * View: the elder, anyone in the same family, or an admin.
 * Manage: the elder, an admin, or a family member whose `canManageOrders` is on for an elder.
 */
async function accessTo(
  caller: { id: ObjectId; isAdmin: boolean },
  elderId: ObjectId,
): Promise<Access> {
  if (caller.isAdmin || caller.id.equals(elderId)) return { canView: true, canManage: true };

  const users = getUsersCollection();
  const [callerUser, elderUser] = await Promise.all([
    users.findOne({ _id: caller.id }),
    users.findOne({ _id: elderId }),
  ]);
  if (!elderUser) throw createError('Person not found', 404);
  if (!callerUser?.familyId || !callerUser.familyId.equals(elderUser.familyId ?? new ObjectId())) {
    return { canView: false, canManage: false };
  }

  const family = await getFamiliesCollection().findOne({ _id: callerUser.familyId });
  const me = family?.members.find((m) => m.userId.equals(caller.id));
  const elder = family?.members.find((m) => m.userId.equals(elderId));
  return {
    canView: Boolean(me && elder),
    canManage: Boolean(me?.canManageOrders && elder?.isElder),
  };
}

const asView = (doc: MedicationDoc): IMedicationView => {
  const medication = {
    ...doc,
    _id: doc._id.toString(),
    elderId: doc.elderId.toString(),
    createdBy: doc.createdBy.toString(),
  };
  return {
    ...medication,
    supplyStatus: medicationSupplyStatus(medication),
    summary: describeMedication(medication),
  };
};

function parse(body: unknown, mode: 'create' | 'update'): MedicationFields {
  const result = validateMedicationInput(body, mode);
  if (!result.ok) throw createError(result.error, 400);
  return result.value;
}

export async function listMedications(req: Request, res: Response): Promise<void> {
  const caller = requireCaller(req);
  const elderId = req.query['elderId']
    ? toObjectId(String(req.query['elderId']), 'elderId')
    : caller.id;
  if (!(await accessTo(caller, elderId)).canView) {
    throw createError("You don't have access to this person's medicines", 403);
  }

  const filter = req.query['includeStopped'] === 'true' ? { elderId } : { elderId, active: true };
  const docs = await getMedicationsCollection()
    .find(filter)
    .sort({ active: -1, name: 1 })
    .toArray();

  const access = await accessTo(caller, elderId);
  res.json({
    success: true,
    data: { items: docs.map(asView), canManage: access.canManage },
  });
}

export async function createMedication(req: Request, res: Response): Promise<void> {
  const caller = requireCaller(req);
  const body = (req.body ?? {}) as { elderId?: string };
  const elderId = body.elderId ? toObjectId(body.elderId, 'elderId') : caller.id;
  if (!(await accessTo(caller, elderId)).canManage) {
    throw createError("You don't have permission to change this person's medicines", 403);
  }

  const v = parse(req.body, 'create');
  const now = new Date();
  const doc: MedicationDoc = {
    _id: new ObjectId(),
    elderId,
    ...buildMedication(v, now),
    createdBy: caller.id,
    createdAt: now,
    updatedAt: now,
  };

  await getMedicationsCollection().insertOne(withoutUndefined(doc));
  res.status(201).json({ success: true, data: asView(doc) });
}

export async function updateMedication(req: Request, res: Response): Promise<void> {
  const caller = requireCaller(req);
  const medications = getMedicationsCollection();
  const existing = await medications.findOne({
    _id: toObjectId(req.params['id'], 'medication ID'),
  });
  if (!existing) throw createError('Medication not found', 404);
  if (!(await accessTo(caller, existing.elderId)).canManage) {
    throw createError("You don't have permission to change this person's medicines", 403);
  }

  const v = parse(req.body, 'update');
  const now = new Date();
  const merged = mergeMedication(existing, v, now);
  if (!merged.ok) throw createError(merged.error, 400);
  const next: MedicationDoc = { ...merged.value, updatedAt: now };

  const { _id, ...fields } = next;
  await medications.updateOne(
    { _id },
    { $set: fields, ...(next.endDate ? {} : { $unset: { endDate: '' } }) },
  );
  res.json({ success: true, data: asView(next) });
}

/** "Delete" stops the medicine but keeps the record (history, past orders). */
export async function stopMedication(req: Request, res: Response): Promise<void> {
  const caller = requireCaller(req);
  const medications = getMedicationsCollection();
  const existing = await medications.findOne({
    _id: toObjectId(req.params['id'], 'medication ID'),
  });
  if (!existing) throw createError('Medication not found', 404);
  if (!(await accessTo(caller, existing.elderId)).canManage) {
    throw createError("You don't have permission to change this person's medicines", 403);
  }

  const now = new Date();
  await medications.updateOne(
    { _id: existing._id },
    { $set: { active: false, endDate: existing.endDate ?? now, updatedAt: now } },
  );
  res.json({ success: true, data: { id: existing._id.toString(), active: false } });
}

const asDoseView = (doc: DoseLogDoc): IDoseLog => ({
  ...doc,
  _id: doc._id.toString(),
  medicationId: doc.medicationId.toString(),
  elderId: doc.elderId.toString(),
  loggedBy: doc.loggedBy.toString(),
  undoneBy: doc.undoneBy?.toString(),
});

async function loadMedicationFor(req: Request, need: keyof Access) {
  const caller = requireCaller(req);
  const existing = await getMedicationsCollection().findOne({
    _id: toObjectId(req.params['id'], 'medication ID'),
  });
  if (!existing) throw createError('Medication not found', 404);
  if (!(await accessTo(caller, existing.elderId))[need]) {
    throw createError(
      need === 'canView'
        ? "You don't have access to this person's medicines"
        : "You don't have permission to log doses for this person",
      403,
    );
  }
  return { caller, existing };
}

/** Marks a dose as taken: reduces the units on hand and records who took it and when. */
export async function logDose(req: Request, res: Response): Promise<void> {
  const { caller, existing } = await loadMedicationFor(req, 'canManage');
  const body = (req.body ?? {}) as LogDoseBody;
  const amount = body.amount === undefined ? existing.dose.amount : Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100) {
    throw createError('amount must be a number between 0 and 100', 400);
  }
  if (body.requestId !== undefined && (typeof body.requestId !== 'string' || !body.requestId)) {
    throw createError('requestId must be a non-empty string', 400);
  }
  if (!existing.active) throw createError('This medicine has been stopped', 409);

  const medications = getMedicationsCollection();
  const logs = getDoseLogsCollection();
  const now = new Date();

  // A retried request returns the current state instead of counting the dose twice.
  if (body.requestId && (await logs.findOne({ requestId: body.requestId }))) {
    const current = await medications.findOne({ _id: existing._id });
    res.json({ success: true, data: { medication: asView(current ?? existing), duplicate: true } });
    return;
  }

  const updated = await medications.findOneAndUpdate(
    { _id: existing._id, 'supply.unitsRemaining': { $gte: amount } },
    { $inc: { 'supply.unitsRemaining': -amount }, $set: { updatedAt: now } },
    { returnDocument: 'after' },
  );
  if (!updated) throw createError('Not enough of this medicine left to log that dose', 409);

  const log: DoseLogDoc = withoutUndefined({
    _id: new ObjectId(),
    medicationId: existing._id,
    elderId: existing.elderId,
    amount,
    takenAt: now,
    loggedBy: caller.id,
    requestId: body.requestId,
  });
  try {
    await logs.insertOne(log);
  } catch (err) {
    // Lost a race with the same requestId: undo our decrement so it isn't counted twice.
    await medications.updateOne(
      { _id: existing._id },
      { $inc: { 'supply.unitsRemaining': amount } },
    );
    if ((err as { code?: number }).code === 11000) {
      const current = await medications.findOne({ _id: existing._id });
      res.json({
        success: true,
        data: { medication: asView(current ?? existing), duplicate: true },
      });
      return;
    }
    throw err;
  }
  res
    .status(201)
    .json({ success: true, data: { medication: asView(updated), dose: asDoseView(log) } });
}

/** Undo the most recent dose (e.g. a mistaken tap): restores the units. */
export async function undoLastDose(req: Request, res: Response): Promise<void> {
  const { caller, existing } = await loadMedicationFor(req, 'canManage');
  const logs = getDoseLogsCollection();
  const now = new Date();

  const last = await logs.findOneAndUpdate(
    { medicationId: existing._id, undoneAt: { $exists: false } },
    { $set: { undoneAt: now, undoneBy: caller.id } },
    { sort: { takenAt: -1 }, returnDocument: 'after' },
  );
  if (!last) throw createError('There is no dose to undo', 404);

  const updated = await getMedicationsCollection().findOneAndUpdate(
    { _id: existing._id },
    { $inc: { 'supply.unitsRemaining': last.amount }, $set: { updatedAt: now } },
    { returnDocument: 'after' },
  );
  res.json({
    success: true,
    data: { medication: asView(updated ?? existing), dose: asDoseView(last) },
  });
}

export async function listDoses(req: Request, res: Response): Promise<void> {
  const { existing } = await loadMedicationFor(req, 'canView');
  const limit = Math.min(Math.max(Number(req.query['limit']) || 10, 1), 50);
  const docs = await getDoseLogsCollection()
    .find({ medicationId: existing._id, undoneAt: { $exists: false } })
    .sort({ takenAt: -1 })
    .limit(limit)
    .toArray();
  res.json({ success: true, data: { items: docs.map(asDoseView) } });
}

const asOrderView = (doc: PharmacyOrderDoc) => ({
  ...doc,
  _id: doc._id.toString(),
  elderId: doc.elderId.toString(),
  orderedBy: doc.orderedBy.toString(),
  items: doc.items.map((i) => ({ ...i, medicationId: i.medicationId?.toString() })),
});

/** ElderCare's record of pharmacy orders placed for an elder (status is refreshed by the assistant). */
export async function listPharmacyOrders(req: Request, res: Response): Promise<void> {
  const caller = requireCaller(req);
  const elderId = req.query['elderId']
    ? toObjectId(String(req.query['elderId']), 'elderId')
    : caller.id;
  if (!(await accessTo(caller, elderId)).canView) {
    throw createError("You don't have access to this person's orders", 403);
  }

  const docs = await getPharmacyOrdersCollection()
    .find({ elderId })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
  res.json({ success: true, data: { items: docs.map(asOrderView) } });
}
