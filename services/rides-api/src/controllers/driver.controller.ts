import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { createError } from '../middleware/errorHandler.js';
import { getDrivers, type DriverDoc } from '../models/rides.model.js';

const serialize = (driver: DriverDoc) => ({
  ...driver,
  id: driver._id.toString(),
  _id: undefined,
});

function toObjectId(id: string | undefined): ObjectId {
  if (!id || !ObjectId.isValid(id)) throw createError(`Invalid ID: ${id ?? ''}`, 400);
  return new ObjectId(id);
}

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const isDuplicate = (err: unknown) => (err as { code?: number }).code === 11000;

/** Active drivers only unless `includeInactive=true` (staff only). */
export async function listDrivers(req: Request, res: Response): Promise<void> {
  const includeInactive = req.staff && req.query['includeInactive'] === 'true';
  const drivers = await getDrivers()
    .find(includeInactive ? {} : { active: true })
    .sort({ name: 1 })
    .toArray();
  res.json({ success: true, data: { items: drivers.map(serialize), total: drivers.length } });
}

export async function getDriver(req: Request, res: Response): Promise<void> {
  const driver = await getDrivers().findOne({ _id: toObjectId(req.params['id']) });
  if (!driver) throw createError('Driver not found', 404);
  res.json({ success: true, data: serialize(driver) });
}

export async function createDriver(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>;
  const name = text(body['name']);
  const vehicle = text(body['vehicle']);
  const plate = text(body['plate']).toUpperCase();
  if (!name) throw createError('name is required', 400);
  if (!vehicle) throw createError('vehicle is required', 400);
  if (!plate) throw createError('plate is required', 400);

  const now = new Date();
  const driver: DriverDoc = {
    _id: new ObjectId(),
    name,
    phone: text(body['phone']) || undefined,
    vehicle,
    plate,
    active: body['active'] === false ? false : true,
    createdAt: now,
    updatedAt: now,
  };
  try {
    await getDrivers().insertOne(driver);
  } catch (err) {
    if (isDuplicate(err)) throw createError(`A driver with plate ${plate} already exists`, 409);
    throw err;
  }
  res.status(201).json({ success: true, data: serialize(driver) });
}

export async function updateDriver(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>;
  const set: Partial<DriverDoc> = {};

  if (body['name'] !== undefined) {
    if (!text(body['name'])) throw createError('name cannot be empty', 400);
    set.name = text(body['name']);
  }
  if (body['vehicle'] !== undefined) {
    if (!text(body['vehicle'])) throw createError('vehicle cannot be empty', 400);
    set.vehicle = text(body['vehicle']);
  }
  if (body['plate'] !== undefined) {
    if (!text(body['plate'])) throw createError('plate cannot be empty', 400);
    set.plate = text(body['plate']).toUpperCase();
  }
  if (body['phone'] !== undefined) set.phone = text(body['phone']) || undefined;
  if (body['active'] !== undefined) {
    if (typeof body['active'] !== 'boolean') throw createError('active must be true or false', 400);
    set.active = body['active'];
  }
  if (Object.keys(set).length === 0) throw createError('Nothing to update', 400);

  try {
    const updated = await getDrivers().findOneAndUpdate(
      { _id: toObjectId(req.params['id']) },
      { $set: { ...set, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!updated) throw createError('Driver not found', 404);
    res.json({ success: true, data: serialize(updated) });
  } catch (err) {
    if (isDuplicate(err)) throw createError('Another driver already has that plate', 409);
    throw err;
  }
}
