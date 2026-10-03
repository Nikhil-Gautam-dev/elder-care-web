import type { FamilyRelationship } from "./user.js";

export type Gender = "male" | "female" | "other";

export interface IFamilyMember {
  userId: string;
  isAdmin: boolean;
  /** This member is someone the family cares for; flags of other members apply to them. */
  isElder: boolean;
  canReceiveNotifications: boolean;
  canManageOrders: boolean;
  canManageRides: boolean;
  joinedAt: Date;
}

/** Permission flags a member holds for the family's elders. */
export type MemberFlags = Pick<
  IFamilyMember,
  "canReceiveNotifications" | "canManageOrders" | "canManageRides"
>;

export interface IFamily {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  members: IFamilyMember[];
  relations: {
    kind: "parent_of" | "spouse" | "sibling";
    a: string;
    b: string;
  }[];
}

export interface IFamilyAlias {
  _id: string;
  familyId: string;
  ownerId: string;
  targetId: string;
  alias: string;
}

/** Member as shown to a viewer: name, derived relation to the viewer and the viewer's own aliases. */
export interface FamilyMemberView extends IFamilyMember {
  name: string;
  phone: string;
  gender?: Gender;
  isMe: boolean;
  /** What this member is to the viewer, e.g. "father". Null for the viewer or unconnected members. */
  relationship: string | null;
  aliases: { id: string; alias: string }[];
}

export interface FamilyView {
  id: string;
  name: string;
  members: FamilyMemberView[];
}

export interface UpdateMemberBody extends Partial<MemberFlags> {
  isElder?: boolean;
  isAdmin?: boolean;
}

export interface SetAliasBody {
  targetId: string;
  alias: string;
}

export interface CreateInviteBody {
  targetPhone?: string;
  /** What the invitee is to the inviter. */
  relationship: FamilyRelationship;
  isElder?: boolean;
  canReceiveNotifications?: boolean;
  canManageOrders?: boolean;
  canManageRides?: boolean;
}
