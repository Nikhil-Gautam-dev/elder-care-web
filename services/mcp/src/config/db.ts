import { MongoClient, type Db, type Collection, type ObjectId } from 'mongodb';
import type { DaySlot, FoodTiming, MedicationForm, PharmacyOrderStatus } from '@eldercare/shared';

let client: MongoClient;
let db: Db;

export const USERS_COLLECTION = 'users';
export const OTPS_COLLECTION = 'otps';
export const FAMILY_INVITES_COLLECTION = 'family_invites';
export const NOTIFICATIONS_COLLECTION = 'notifications';
export const FAMILIES_COLLECTION = 'families';
export const FAMILY_ALIASES_COLLECTION = 'family_aliases';
export const MEDICATIONS_COLLECTION = 'medications';
export const PHARMACY_ORDERS_COLLECTION = 'pharmacy_orders';
export const ORDER_DRAFTS_COLLECTION = 'pharmacy_order_drafts';
export const DOSE_LOGS_COLLECTION = 'medication_dose_logs';

export interface UserDoc {
  _id: ObjectId;
  name: string;
  phone: string;
  age?: number;
  email?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  preferences: {
    language: string;
    usualPharmacy?: string;
    preferredRide?: 'standard' | 'premium' | 'accessible';
    notificationChannel: 'app' | 'sms' | 'whatsapp' | 'email';
  };
  gender?: 'male' | 'female' | 'other';
  familyId?: ObjectId;
  accessibility: {
    largeText: boolean;
    voiceEnabled: boolean;
  };
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyInviteDoc {
  _id: ObjectId;
  inviterId: ObjectId;
  inviterName: string;
  inviterPhone: string;
  familyId: ObjectId;
  targetPhone?: string;
  relationship: string;
  isElder: boolean;
  canReceiveNotifications: boolean;
  canManageOrders: boolean;
  canManageRides: boolean;
  token: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMemberDoc {
  userId: ObjectId;
  isAdmin: boolean;
  isElder: boolean;
  canReceiveNotifications: boolean;
  canManageOrders: boolean;
  canManageRides: boolean;
  joinedAt: Date;
}

export interface FamilyDoc {
  _id: ObjectId;
  name: string;
  createdBy: ObjectId;
  createdAt: Date;
  members: FamilyMemberDoc[];
  relations: { kind: 'parent_of' | 'spouse' | 'sibling'; a: ObjectId; b: ObjectId }[];
}

export interface FamilyAliasDoc {
  _id: ObjectId;
  familyId: ObjectId;
  ownerId: ObjectId;
  targetId: ObjectId;
  alias: string;
  aliasNorm: string;
}

export interface MedicationDoc {
  _id: ObjectId;
  elderId: ObjectId;
  name: string;
  genericName?: string;
  strength: string;
  form: MedicationForm;
  dose: { amount: number; unit: string };
  schedule: {
    slots: DaySlot[];
    times: string[];
    food: FoodTiming;
    asNeeded: boolean;
    instructions?: string;
  };
  supply: { unitsPerPack: number; unitsRemaining: number; asOf: Date; refillThresholdDays: number };
  prescribedBy?: string;
  startDate: Date;
  endDate?: Date;
  active: boolean;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoseLogDoc {
  _id: ObjectId;
  medicationId: ObjectId;
  elderId: ObjectId;
  amount: number;
  takenAt: Date;
  loggedBy: ObjectId;
  requestId?: string;
  undoneAt?: Date;
  undoneBy?: ObjectId;
}

export interface OrderLine {
  medicationId?: ObjectId;
  catalogItemId: string;
  brand: string;
  generic: string;
  strength: string;
  packs: number;
  packSize: number;
  packUnit: string;
  pricePerPack: number;
}

export interface PharmacyOrderDoc {
  _id: ObjectId;
  pharmacyOrderId: string;
  orderNumber: string;
  elderId: ObjectId;
  orderedBy: ObjectId;
  orderedByName: string;
  items: OrderLine[];
  total: number;
  status: PharmacyOrderStatus;
  statusUpdatedAt: Date;
  suppliesApplied: boolean;
  createdAt: Date;
}

/** What the user confirmed: `place_order` can only place exactly this. Expires after 15 minutes. */
export interface OrderDraftDoc {
  _id: ObjectId;
  callerId: ObjectId;
  elderId: ObjectId;
  items: OrderLine[];
  total: number;
  customer: {
    name: string;
    phone: string;
    address: { line1: string; line2?: string; city: string; state?: string; postalCode?: string };
  };
  used: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface NotificationDoc {
  _id?: ObjectId;
  recipientId: ObjectId;
  senderId: ObjectId;
  senderName: string;
  aboutUserId: ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME ?? 'eldercare';

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.info(`[mcp-db] Connected to MongoDB: ${db.databaseName}`);
}

export function getDb(): Db {
  if (!db) throw new Error('Database not initialised — call connectDb() first');
  return db;
}

export function getUsersCollection(): Collection<UserDoc> {
  return getDb().collection<UserDoc>(USERS_COLLECTION);
}

export function getFamilyInvitesCollection(): Collection<FamilyInviteDoc> {
  return getDb().collection<FamilyInviteDoc>(FAMILY_INVITES_COLLECTION);
}

export function getNotificationsCollection(): Collection<NotificationDoc> {
  return getDb().collection<NotificationDoc>(NOTIFICATIONS_COLLECTION);
}

export function getFamiliesCollection(): Collection<FamilyDoc> {
  return getDb().collection<FamilyDoc>(FAMILIES_COLLECTION);
}

export function getFamilyAliasesCollection(): Collection<FamilyAliasDoc> {
  return getDb().collection<FamilyAliasDoc>(FAMILY_ALIASES_COLLECTION);
}

export const getMedicationsCollection = (): Collection<MedicationDoc> =>
  getDb().collection<MedicationDoc>(MEDICATIONS_COLLECTION);

export const getDoseLogsCollection = (): Collection<DoseLogDoc> =>
  getDb().collection<DoseLogDoc>(DOSE_LOGS_COLLECTION);

export const getPharmacyOrdersCollection = (): Collection<PharmacyOrderDoc> =>
  getDb().collection<PharmacyOrderDoc>(PHARMACY_ORDERS_COLLECTION);

export const getOrderDraftsCollection = (): Collection<OrderDraftDoc> =>
  getDb().collection<OrderDraftDoc>(ORDER_DRAFTS_COLLECTION);

export async function ensureMcpIndexes(): Promise<void> {
  await getOrderDraftsCollection().createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await getDoseLogsCollection().createIndex({ medicationId: 1, takenAt: -1 });
}

export async function closeDb(): Promise<void> {
  await client?.close();
}
