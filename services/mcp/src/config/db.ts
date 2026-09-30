import { MongoClient, type Db, type Collection, type ObjectId } from 'mongodb';

let client: MongoClient;
let db: Db;

export const USERS_COLLECTION = 'users';
export const OTPS_COLLECTION = 'otps';
export const FAMILY_INVITES_COLLECTION = 'family_invites';
export const NOTIFICATIONS_COLLECTION = 'notifications';

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
  familyMembers: {
    userId: ObjectId;
    relationship: string;
    canReceiveNotifications: boolean;
    canManageOrders: boolean;
    canManageRides: boolean;
    inviteId?: ObjectId;
    linkedAt?: Date;
  }[];
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
  targetPhone?: string;
  relationship: string;
  canReceiveNotifications: boolean;
  canManageOrders: boolean;
  canManageRides: boolean;
  token: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
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

export async function closeDb(): Promise<void> {
  await client?.close();
}
