export type FamilyRelationship =
  | "son"
  | "daughter"
  | "child"
  | "spouse"
  | "parent"
  | "sibling"
  | "caregiver"
  | "other";

export type NotificationChannel = "app" | "sms" | "whatsapp" | "email";

export type RidePreference = "standard" | "premium" | "accessible";

export type UserStatus = "active" | "inactive";

export interface IAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IPreferences {
  language: string;
  usualPharmacy?: string;
  preferredRide?: RidePreference;
  notificationChannel: NotificationChannel;
}

export interface IAccessibility {
  largeText: boolean;
  voiceEnabled: boolean;
}

export interface IFamilyMember {
  userId: string;
  relationship: FamilyRelationship;
  canReceiveNotifications: boolean;
  canManageOrders: boolean;
  canManageRides: boolean;
  inviteId?: string;
  linkedAt?: Date;
}

export type InviteStatus =
  "pending" | "accepted" | "rejected" | "cancelled" | "expired";

export interface IFamilyInvite {
  _id: string;
  inviterId: string;
  inviterName: string;
  inviterPhone: string;
  targetPhone?: string;
  relationship: FamilyRelationship;
  canReceiveNotifications: boolean;
  canManageOrders: boolean;
  canManageRides: boolean;
  token: string;
  status: InviteStatus;
  expiresAt: Date;
  createdAt: Date;
}

export interface CreateInviteBody {
  targetPhone?: string;
  relationship: FamilyRelationship;
  canReceiveNotifications?: boolean;
  canManageOrders?: boolean;
  canManageRides?: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  phone: string;
  age?: number;
  email?: string;
  address?: IAddress;
  preferences: IPreferences;
  familyMembers: IFamilyMember[];
  accessibility: IAccessibility;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserBody = Omit<
  IUser,
  "_id" | "status" | "createdAt" | "updatedAt"
> & {
  status?: UserStatus;
};

export type UpdateUserBody = Partial<
  Pick<
    IUser,
    "name" | "age" | "email" | "address" | "preferences" | "accessibility"
  >
>;

export type AddFamilyMemberBody = IFamilyMember;

export type UpdateFamilyMemberBody = Partial<
  Pick<
    IFamilyMember,
    | "relationship"
    | "canReceiveNotifications"
    | "canManageOrders"
    | "canManageRides"
  >
>;

export interface AuthContext {
  id: string;
  phone: string;
  role: "user" | "admin";
}
