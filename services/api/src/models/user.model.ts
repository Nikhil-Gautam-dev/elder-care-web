import { type Collection, type ObjectId } from 'mongodb';
import type { DaySlot, FoodTiming, MedicationForm, PharmacyOrderStatus } from '@eldercare/shared';
import { getDb } from '../config/db.js';

export const USERS_COLLECTION = 'users';
export const OTPS_COLLECTION = 'otps';
export const FAMILY_INVITES_COLLECTION = 'family_invites';
export const FAMILIES_COLLECTION = 'families';
export const FAMILY_ALIASES_COLLECTION = 'family_aliases';
export const MEDICATIONS_COLLECTION = 'medications';
export const PHARMACY_ORDERS_COLLECTION = 'pharmacy_orders';

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

export interface OtpDoc {
  _id: ObjectId;
  phone: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface FamilyInviteDoc {
  _id: ObjectId;
  inviterId: ObjectId;
  inviterName: string;
  inviterPhone: string;
  familyId: ObjectId;
  targetPhone?: string;
  /** What the invitee is to the inviter. */
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
  /** `parent_of`: a is the parent of b. `spouse` / `sibling` are symmetric. */
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
  supply: {
    unitsPerPack: number;
    unitsRemaining: number;
    asOf: Date;
    refillThresholdDays: number;
  };
  prescribedBy?: string;
  startDate: Date;
  endDate?: Date;
  active: boolean;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface PharmacyOrderDoc {
  _id: ObjectId;
  pharmacyOrderId: string;
  orderNumber: string;
  elderId: ObjectId;
  orderedBy: ObjectId;
  orderedByName: string;
  items: {
    medicationId?: ObjectId;
    catalogItemId: string;
    brand: string;
    generic: string;
    strength: string;
    packs: number;
    packSize: number;
    packUnit: string;
    pricePerPack: number;
  }[];
  total: number;
  status: PharmacyOrderStatus;
  statusUpdatedAt: Date;
  suppliesApplied: boolean;
  createdAt: Date;
}

export function getUsersCollection(): Collection<UserDoc> {
  return getDb().collection<UserDoc>(USERS_COLLECTION);
}

export function getOtpsCollection(): Collection<OtpDoc> {
  return getDb().collection<OtpDoc>(OTPS_COLLECTION);
}

export function getFamilyInvitesCollection(): Collection<FamilyInviteDoc> {
  return getDb().collection<FamilyInviteDoc>(FAMILY_INVITES_COLLECTION);
}

export function getFamiliesCollection(): Collection<FamilyDoc> {
  return getDb().collection<FamilyDoc>(FAMILIES_COLLECTION);
}

export function getFamilyAliasesCollection(): Collection<FamilyAliasDoc> {
  return getDb().collection<FamilyAliasDoc>(FAMILY_ALIASES_COLLECTION);
}

export function getMedicationsCollection(): Collection<MedicationDoc> {
  return getDb().collection<MedicationDoc>(MEDICATIONS_COLLECTION);
}

export function getPharmacyOrdersCollection(): Collection<PharmacyOrderDoc> {
  return getDb().collection<PharmacyOrderDoc>(PHARMACY_ORDERS_COLLECTION);
}

export async function ensureIndexes(): Promise<void> {
  const users = getUsersCollection();
  const otps = getOtpsCollection();
  const invites = getFamilyInvitesCollection();

  await users.createIndex({ phone: 1 }, { unique: true });
  await users.createIndex({ email: 1 }, { sparse: true });
  await users.createIndex({ status: 1 });

  await otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await otps.createIndex({ phone: 1 });

  await users.createIndex({ familyId: 1 }, { sparse: true });

  await invites.createIndex({ token: 1 }, { unique: true });
  await invites.createIndex({ familyId: 1, status: 1 });
  await invites.createIndex({ inviterId: 1, status: 1 });
  await invites.createIndex({ targetPhone: 1, status: 1 });
  await invites.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  const aliases = getFamilyAliasesCollection();
  await aliases.createIndex({ ownerId: 1, aliasNorm: 1 });
  await aliases.createIndex({ ownerId: 1, targetId: 1, aliasNorm: 1 }, { unique: true });
  await aliases.createIndex({ familyId: 1 });

  await getMedicationsCollection().createIndex({ elderId: 1, active: 1 });
  await getPharmacyOrdersCollection().createIndex({ elderId: 1, createdAt: -1 });
  await getPharmacyOrdersCollection().createIndex({ pharmacyOrderId: 1 }, { unique: true });

  console.info('[db] Indexes ensured');
}
