import { type Collection, type ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';

export interface CatalogDoc {
  _id: ObjectId;
  brand: string;
  generic: string;
  strength: string;
  form: string;
  /** Units (tablets, ml, …) in one pack. */
  packSize: number;
  packUnit: string;
  /** Price of one pack in INR. */
  pricePerPack: number;
  /** Packs currently in stock. */
  stockPacks: number;
  manufacturer?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const ORDER_STATUSES = [
  'placed',
  'accepted',
  'packed',
  'out_for_delivery',
  'delivered',
  'rejected',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItemDoc {
  catalogId: ObjectId;
  brand: string;
  generic: string;
  strength: string;
  packSize: number;
  packUnit: string;
  packs: number;
  pricePerPack: number;
  lineTotal: number;
}

export interface OrderDoc {
  _id: ObjectId;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postalCode?: string;
    };
  };
  items: OrderItemDoc[];
  total: number;
  paymentMethod: 'cod';
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: Date; note?: string }[];
  rejectionReason?: string;
  notes?: string;
  /** Opaque reference from the calling system (e.g. who ordered, for whom). */
  externalRef?: Record<string, string>;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PharmacistDoc {
  _id: ObjectId;
  username: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

interface CounterDoc {
  _id: string;
  seq: number;
}

export const getCatalog = (): Collection<CatalogDoc> => getDb().collection('catalog');
export const getOrders = (): Collection<OrderDoc> => getDb().collection('orders');
export const getPharmacists = (): Collection<PharmacistDoc> => getDb().collection('pharmacists');
export const getCounters = (): Collection<CounterDoc> => getDb().collection('counters');

/** Human-friendly sequential order numbers: PH-000001, PH-000002, … */
export async function nextOrderNumber(): Promise<string> {
  const counter = await getCounters().findOneAndUpdate(
    { _id: 'orders' },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  return `PH-${String(counter?.seq ?? 1).padStart(6, '0')}`;
}

export async function ensureIndexes(): Promise<void> {
  await getCatalog().createIndex({ brand: 1, strength: 1 }, { unique: true });
  await getCatalog().createIndex({ generic: 1 });
  await getOrders().createIndex({ status: 1, createdAt: -1 });
  await getOrders().createIndex({ 'customer.phone': 1, createdAt: -1 });
  await getOrders().createIndex({ orderNumber: 1 }, { unique: true });
  await getOrders().createIndex(
    { idempotencyKey: 1 },
    { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } },
  );
  await getPharmacists().createIndex({ username: 1 }, { unique: true });
  console.info('[pharmacy-db] Indexes ensured');
}
