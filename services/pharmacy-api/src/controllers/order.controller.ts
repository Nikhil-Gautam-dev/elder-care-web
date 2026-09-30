import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { createError } from '../middleware/errorHandler.js';
import { normalizeIndianPhone } from '../lib/phone.js';
import {
  getCatalog,
  getOrders,
  nextOrderNumber,
  ORDER_STATUSES,
  type OrderDoc,
  type OrderItemDoc,
  type OrderStatus,
} from '../models/pharmacy.model.js';

const MAX_ITEMS = 20;
const MAX_PACKS_PER_ITEM = 50;

/** Pharmacist-driven transitions. Customers can additionally cancel while placed/accepted. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ['accepted', 'rejected'],
  accepted: ['packed', 'rejected'],
  packed: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  rejected: [],
  cancelled: [],
};
const CUSTOMER_CANCELLABLE: OrderStatus[] = ['placed', 'accepted'];

const serialize = (order: OrderDoc) => ({
  ...order,
  id: order._id.toString(),
  _id: undefined,
  items: order.items.map((item) => ({ ...item, catalogId: item.catalogId.toString() })),
});

const round2 = (n: number) => Math.round(n * 100) / 100;

function toObjectId(id: string | undefined): ObjectId {
  if (!id || !ObjectId.isValid(id)) throw createError(`Invalid ID: ${id ?? ''}`, 400);
  return new ObjectId(id);
}

async function restoreStock(items: OrderItemDoc[]): Promise<void> {
  if (items.length === 0) return;
  await getCatalog().bulkWrite(
    items.map((item) => ({
      updateOne: { filter: { _id: item.catalogId }, update: { $inc: { stockPacks: item.packs } } },
    })),
  );
}

interface CreateOrderBody {
  customer?: {
    name?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
    };
  };
  items?: { catalogItemId?: string; packs?: number }[];
  notes?: string;
  externalRef?: Record<string, unknown>;
  idempotencyKey?: string;
}

/** Partner API: places a cash-on-delivery order, reserving stock atomically. */
export async function createOrder(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateOrderBody;

  const name = body.customer?.name?.trim();
  const phone = normalizeIndianPhone(String(body.customer?.phone ?? ''));
  const address = body.customer?.address;
  if (!name) throw createError('customer.name is required', 400);
  if (!phone)
    throw createError('customer.phone must be a valid 10-digit Indian mobile number', 400);
  if (!address?.line1?.trim() || !address.city?.trim()) {
    throw createError('customer.address needs at least line1 and city', 400);
  }

  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > MAX_ITEMS) {
    throw createError(`items must contain between 1 and ${MAX_ITEMS} entries`, 400);
  }

  // Merge duplicate lines for the same medicine.
  const wanted = new Map<string, number>();
  for (const line of body.items) {
    const packs = line.packs;
    if (!line.catalogItemId || !ObjectId.isValid(line.catalogItemId)) {
      throw createError('Every item needs a valid catalogItemId', 400);
    }
    if (
      !Number.isInteger(packs) ||
      (packs as number) < 1 ||
      (packs as number) > MAX_PACKS_PER_ITEM
    ) {
      throw createError(`packs must be a whole number between 1 and ${MAX_PACKS_PER_ITEM}`, 400);
    }
    wanted.set(line.catalogItemId, (wanted.get(line.catalogItemId) ?? 0) + (packs as number));
  }

  const idempotencyKey = body.idempotencyKey?.trim() || undefined;
  const orders = getOrders();

  if (idempotencyKey) {
    const existing = await orders.findOne({ idempotencyKey });
    if (existing) {
      res.status(200).json({ success: true, idempotent: true, data: serialize(existing) });
      return;
    }
  }

  // Reserve stock line by line; undo everything if any line can't be fulfilled.
  const catalog = getCatalog();
  const reserved: OrderItemDoc[] = [];
  let stored = false;
  try {
    for (const [catalogItemId, packs] of wanted) {
      const _id = new ObjectId(catalogItemId);
      const item = await catalog.findOneAndUpdate(
        { _id, active: true, stockPacks: { $gte: packs } },
        { $inc: { stockPacks: -packs }, $set: { updatedAt: new Date() } },
        { returnDocument: 'after' },
      );

      if (!item) {
        const current = await catalog.findOne({ _id });
        if (!current || !current.active) {
          throw createError('One of the medicines is not available', 404, { catalogItemId });
        }
        throw createError(
          `Only ${current.stockPacks} pack(s) of ${current.brand} ${current.strength} in stock`,
          409,
          { catalogItemId, availablePacks: current.stockPacks, requestedPacks: packs },
        );
      }

      reserved.push({
        catalogId: item._id,
        brand: item.brand,
        generic: item.generic,
        strength: item.strength,
        packSize: item.packSize,
        packUnit: item.packUnit,
        packs,
        pricePerPack: item.pricePerPack,
        lineTotal: round2(item.pricePerPack * packs),
      });
    }

    const now = new Date();
    const order: OrderDoc = {
      _id: new ObjectId(),
      orderNumber: await nextOrderNumber(),
      customer: {
        name,
        phone,
        address: {
          line1: address.line1.trim(),
          line2: address.line2?.trim() || undefined,
          city: address.city.trim(),
          state: address.state?.trim() || undefined,
          postalCode: address.postalCode?.trim() || undefined,
        },
      },
      items: reserved,
      total: round2(reserved.reduce((sum, item) => sum + item.lineTotal, 0)),
      paymentMethod: 'cod',
      status: 'placed',
      statusHistory: [{ status: 'placed', at: now }],
      notes: body.notes?.trim() || undefined,
      externalRef: body.externalRef
        ? Object.fromEntries(Object.entries(body.externalRef).map(([k, v]) => [k, String(v)]))
        : undefined,
      idempotencyKey,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await orders.insertOne(order);
      stored = true;
    } catch (err) {
      // A concurrent request with the same idempotency key won the race.
      if ((err as { code?: number }).code === 11000 && idempotencyKey) {
        const existing = await orders.findOne({ idempotencyKey });
        if (existing) {
          await restoreStock(reserved);
          reserved.length = 0;
          res.status(200).json({ success: true, idempotent: true, data: serialize(existing) });
          return;
        }
      }
      throw err;
    }

    res.status(201).json({ success: true, data: serialize(order) });
  } catch (err) {
    // Undo the stock reservation unless the order was stored.
    if (!stored && reserved.length) await restoreStock(reserved).catch(() => undefined);
    throw err;
  }
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  const idParam = req.params['id'];
  const order = idParam?.startsWith('PH-')
    ? await getOrders().findOne({ orderNumber: idParam })
    : await getOrders().findOne({ _id: toObjectId(idParam) });
  if (!order) throw createError('Order not found', 404);
  res.json({ success: true, data: serialize(order) });
}

/**
 * Filters: `status` (comma separated), `customerPhone`, `ref.<key>=value` (matches the caller's
 * externalRef), `limit`, `page`.
 */
export async function listOrders(req: Request, res: Response): Promise<void> {
  const filter: Record<string, unknown> = {};

  const status = String(req.query['status'] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (status.length) {
    const invalid = status.filter((s) => !ORDER_STATUSES.includes(s as OrderStatus));
    if (invalid.length) throw createError(`Unknown status: ${invalid.join(', ')}`, 400);
    filter['status'] = { $in: status };
  }

  if (req.query['customerPhone']) {
    const phone = normalizeIndianPhone(String(req.query['customerPhone']));
    if (!phone)
      throw createError('customerPhone must be a valid 10-digit Indian mobile number', 400);
    filter['customer.phone'] = phone;
  }

  for (const [key, value] of Object.entries(req.query)) {
    if (key.startsWith('ref.') && typeof value === 'string' && /^[\w-]+$/.test(key.slice(4))) {
      filter[`externalRef.${key.slice(4)}`] = value;
    }
  }

  const limit = Math.min(100, Math.max(1, Number(req.query['limit'] ?? 50)));
  const page = Math.max(1, Number(req.query['page'] ?? 1));

  const orders = getOrders();
  const [items, total] = await Promise.all([
    orders
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    orders.countDocuments(filter),
  ]);

  res.json({ success: true, data: { items: items.map(serialize), total, page, limit } });
}

/** Pharmacist: moves an order along the fulfilment flow. */
export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const { status, note, reason } = req.body as {
    status?: OrderStatus;
    note?: string;
    reason?: string;
  };
  if (!status || !ORDER_STATUSES.includes(status)) {
    throw createError(`status must be one of ${ORDER_STATUSES.join(', ')}`, 400);
  }
  if (status === 'rejected' && !reason?.trim()) {
    throw createError('A reason is required when rejecting an order', 400);
  }

  const _id = toObjectId(req.params['id']);
  const orders = getOrders();
  const order = await orders.findOne({ _id });
  if (!order) throw createError('Order not found', 404);

  if (!TRANSITIONS[order.status].includes(status)) {
    throw createError(`An order that is ${order.status} cannot become ${status}`, 409);
  }

  const now = new Date();
  const updated = await orders.findOneAndUpdate(
    { _id, status: order.status },
    {
      $set: {
        status,
        updatedAt: now,
        ...(status === 'rejected' ? { rejectionReason: reason!.trim() } : {}),
      },
      $push: { statusHistory: { status, at: now, ...(note?.trim() ? { note: note.trim() } : {}) } },
    },
    { returnDocument: 'after' },
  );
  if (!updated) throw createError('The order was changed by someone else — refresh and retry', 409);

  if (status === 'rejected') await restoreStock(order.items);

  res.json({ success: true, data: serialize(updated) });
}

/** Partner API: the customer cancels before packing. Stock goes back on the shelf. */
export async function cancelOrder(req: Request, res: Response): Promise<void> {
  const _id = toObjectId(req.params['id']);
  const orders = getOrders();
  const order = await orders.findOne({ _id });
  if (!order) throw createError('Order not found', 404);

  if (!CUSTOMER_CANCELLABLE.includes(order.status)) {
    throw createError(`An order that is ${order.status} can no longer be cancelled`, 409);
  }

  const now = new Date();
  const updated = await orders.findOneAndUpdate(
    { _id, status: order.status },
    {
      $set: { status: 'cancelled', updatedAt: now },
      $push: { statusHistory: { status: 'cancelled', at: now, note: 'Cancelled by customer' } },
    },
    { returnDocument: 'after' },
  );
  if (!updated) throw createError('The order was changed by someone else — refresh and retry', 409);

  await restoreStock(order.items);
  res.json({ success: true, data: serialize(updated) });
}
