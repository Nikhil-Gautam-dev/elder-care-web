import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { createError } from '../middleware/errorHandler.js';
import { getCatalog, type CatalogDoc } from '../models/pharmacy.model.js';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const serialize = (doc: CatalogDoc) => ({ ...doc, id: doc._id.toString(), _id: undefined });

function toObjectId(id: string | undefined): ObjectId {
  if (!id || !ObjectId.isValid(id)) throw createError(`Invalid ID: ${id ?? ''}`, 400);
  return new ObjectId(id);
}

/** Search by brand or generic name (case-insensitive). Partners only see active items. */
export async function searchCatalog(req: Request, res: Response): Promise<void> {
  const q = String(req.query['q'] ?? '').trim();
  const limit = Math.min(50, Math.max(1, Number(req.query['limit'] ?? 20)));
  const includeInactive = req.pharmacist !== undefined && req.query['includeInactive'] === 'true';

  const filter: Record<string, unknown> = includeInactive ? {} : { active: true };
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter['$or'] = [{ brand: pattern }, { generic: pattern }];
  }

  const items = await getCatalog()
    .find(filter)
    .sort({ generic: 1, brand: 1, strength: 1 })
    .limit(limit)
    .toArray();
  res.json({ success: true, data: { items: items.map(serialize), count: items.length } });
}

export async function getCatalogItem(req: Request, res: Response): Promise<void> {
  const item = await getCatalog().findOne({ _id: toObjectId(req.params['id']) });
  if (!item || (!item.active && !req.pharmacist)) throw createError('Medicine not found', 404);
  res.json({ success: true, data: serialize(item) });
}

interface CatalogBody {
  brand?: string;
  generic?: string;
  strength?: string;
  form?: string;
  packSize?: number;
  packUnit?: string;
  pricePerPack?: number;
  stockPacks?: number;
  manufacturer?: string;
  active?: boolean;
}

const isPositive = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n > 0;
const isNonNegInt = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 0;

export async function createCatalogItem(req: Request, res: Response): Promise<void> {
  const b = req.body as CatalogBody;
  if (!b.brand?.trim() || !b.generic?.trim() || !b.strength?.trim() || !b.form?.trim()) {
    throw createError('brand, generic, strength and form are required', 400);
  }
  if (!isPositive(b.packSize) || !Number.isInteger(b.packSize)) {
    throw createError('packSize must be a positive whole number', 400);
  }
  if (!isPositive(b.pricePerPack)) throw createError('pricePerPack must be greater than 0', 400);
  if (b.stockPacks !== undefined && !isNonNegInt(b.stockPacks)) {
    throw createError('stockPacks must be a whole number ≥ 0', 400);
  }

  const now = new Date();
  const doc: CatalogDoc = {
    _id: new ObjectId(),
    brand: b.brand.trim(),
    generic: b.generic.trim(),
    strength: b.strength.trim(),
    form: b.form.trim(),
    packSize: b.packSize,
    packUnit: b.packUnit?.trim() || 'units',
    pricePerPack: b.pricePerPack,
    stockPacks: b.stockPacks ?? 0,
    manufacturer: b.manufacturer?.trim() || undefined,
    active: b.active ?? true,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await getCatalog().insertOne(doc);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      throw createError('That brand and strength already exist in the catalog', 409);
    }
    throw err;
  }
  res.status(201).json({ success: true, data: serialize(doc) });
}

export async function updateCatalogItem(req: Request, res: Response): Promise<void> {
  const b = req.body as CatalogBody;
  const $set: Record<string, unknown> = { updatedAt: new Date() };

  for (const field of [
    'brand',
    'generic',
    'strength',
    'form',
    'packUnit',
    'manufacturer',
  ] as const) {
    const value = b[field];
    if (value === undefined) continue;
    if (typeof value !== 'string' || !value.trim()) throw createError(`${field} must be text`, 400);
    $set[field] = value.trim();
  }
  if (b.packSize !== undefined) {
    if (!isPositive(b.packSize) || !Number.isInteger(b.packSize)) {
      throw createError('packSize must be a positive whole number', 400);
    }
    $set['packSize'] = b.packSize;
  }
  if (b.pricePerPack !== undefined) {
    if (!isPositive(b.pricePerPack)) throw createError('pricePerPack must be greater than 0', 400);
    $set['pricePerPack'] = b.pricePerPack;
  }
  if (b.stockPacks !== undefined) {
    if (!isNonNegInt(b.stockPacks)) throw createError('stockPacks must be a whole number ≥ 0', 400);
    $set['stockPacks'] = b.stockPacks;
  }
  if (b.active !== undefined) {
    if (typeof b.active !== 'boolean') throw createError('active must be true or false', 400);
    $set['active'] = b.active;
  }

  const updated = await getCatalog().findOneAndUpdate(
    { _id: toObjectId(req.params['id']) },
    { $set },
    { returnDocument: 'after' },
  );
  if (!updated) throw createError('Medicine not found', 404);
  res.json({ success: true, data: serialize(updated) });
}

/** Set stock to an absolute number, or adjust it with a (possibly negative) delta. */
export async function updateStock(req: Request, res: Response): Promise<void> {
  const { stockPacks, delta } = req.body as { stockPacks?: number; delta?: number };
  const _id = toObjectId(req.params['id']);

  let updated: CatalogDoc | null;
  if (stockPacks !== undefined) {
    if (!isNonNegInt(stockPacks)) throw createError('stockPacks must be a whole number ≥ 0', 400);
    updated = await getCatalog().findOneAndUpdate(
      { _id },
      { $set: { stockPacks, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
  } else if (Number.isInteger(delta)) {
    updated = await getCatalog().findOneAndUpdate(
      { _id, stockPacks: { $gte: -(delta as number) } },
      { $inc: { stockPacks: delta as number }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!updated) throw createError('Stock cannot go below zero', 409);
  } else {
    throw createError('Provide stockPacks or delta', 400);
  }

  if (!updated) throw createError('Medicine not found', 404);
  res.json({ success: true, data: serialize(updated) });
}
