import { type Collection, type ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';

export const RIDE_STATUSES = [
  'requested',
  'accepted',
  'arriving',
  'in_progress',
  'completed',
  'rejected',
  'cancelled',
] as const;
export type RideStatus = (typeof RIDE_STATUSES)[number];

export interface PlaceDoc {
  address: string;
  lat?: number;
  lng?: number;
}

export interface RideDoc {
  _id: ObjectId;
  rideNumber: string;
  pickup: PlaceDoc;
  drop: PlaceDoc;
  rider: { name: string; phone: string };
  /** Null means "as soon as possible". */
  scheduledAt: Date | null;
  notes?: string;
  /** Estimated fare in INR. */
  fareEstimate: number;
  status: RideStatus;
  statusHistory: { status: RideStatus; at: Date; note?: string }[];
  /** Snapshot of the driver assigned on accept. */
  driver?: { id: ObjectId; name: string; vehicle: string; plate: string };
  rejectionReason?: string;
  /** Opaque reference from the calling system (e.g. who booked, for whom). */
  externalRef?: Record<string, string>;
  requestId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverDoc {
  _id: ObjectId;
  name: string;
  phone?: string;
  vehicle: string;
  plate: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffDoc {
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

export const getRides = (): Collection<RideDoc> => getDb().collection('rides');
export const getDrivers = (): Collection<DriverDoc> => getDb().collection('drivers');
export const getStaff = (): Collection<StaffDoc> => getDb().collection('staff');
export const getCounters = (): Collection<CounterDoc> => getDb().collection('counters');

/** Human-friendly sequential ride numbers: RD-000001, RD-000002, … */
export async function nextRideNumber(): Promise<string> {
  const counter = await getCounters().findOneAndUpdate(
    { _id: 'rides' },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  return `RD-${String(counter?.seq ?? 1).padStart(6, '0')}`;
}

export async function ensureIndexes(): Promise<void> {
  await getRides().createIndex({ status: 1, createdAt: -1 });
  await getRides().createIndex({ 'rider.phone': 1, createdAt: -1 });
  await getRides().createIndex({ rideNumber: 1 }, { unique: true });
  await getRides().createIndex(
    { requestId: 1 },
    { unique: true, partialFilterExpression: { requestId: { $type: 'string' } } },
  );
  await getDrivers().createIndex({ plate: 1 }, { unique: true });
  await getStaff().createIndex({ username: 1 }, { unique: true });
  console.info('[rides-db] Indexes ensured');
}
