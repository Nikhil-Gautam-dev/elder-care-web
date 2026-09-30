import { ObjectId } from 'mongodb';
import { getUsersCollection, type UserDoc } from '../config/db.js';
import type { AuthContext } from '@eldercare/shared';

export interface ResolvedUserResult {
  callerUser: UserDoc | null;
  targetUser: UserDoc | null;
  relationshipWithCaller: string | null;
  isSelf: boolean;
  isAdmin: boolean;
  isLinkedFamily: boolean;
  canReceiveNotifications: boolean;
  canManageOrders: boolean;
  canManageRides: boolean;
  error?: string;
}

const RELATION_ALIASES: Record<string, string[]> = {
  mom: ['mother', 'mom', 'parent'],
  mother: ['mother', 'mom', 'parent'],
  dad: ['father', 'dad', 'parent'],
  father: ['father', 'dad', 'parent'],
  son: ['son', 'child'],
  daughter: ['daughter', 'child'],
  wife: ['spouse'],
  husband: ['spouse'],
  brother: ['sibling'],
  sister: ['sibling'],
};

function denied(
  callerUser: UserDoc | null,
  isAdmin: boolean,
  error: string,
  targetUser: UserDoc | null = null,
): ResolvedUserResult {
  return {
    callerUser,
    targetUser,
    relationshipWithCaller: null,
    isSelf: false,
    isAdmin,
    isLinkedFamily: false,
    canReceiveNotifications: false,
    canManageOrders: false,
    canManageRides: false,
    error,
  };
}

function selfResult(user: UserDoc, isAdmin: boolean): ResolvedUserResult {
  return {
    callerUser: user,
    targetUser: user,
    relationshipWithCaller: 'self',
    isSelf: true,
    isAdmin,
    isLinkedFamily: false,
    canReceiveNotifications: true,
    canManageOrders: true,
    canManageRides: true,
  };
}

/**
 * Resolves who a tool call is about ("me", "mom", a family member's name, a user id or phone)
 * and computes what the authenticated caller is allowed to do for that person.
 */
export async function resolveTargetUserAndAuth(
  targetIdentifier: string | undefined,
  auth?: AuthContext,
): Promise<ResolvedUserResult> {
  const users = getUsersCollection();
  const isAdmin = auth?.role === 'admin';

  if (!auth?.id || !ObjectId.isValid(auth.id)) {
    return denied(null, isAdmin, 'The user is not signed in, so no account data can be accessed.');
  }

  const callerUser = await users.findOne({ _id: new ObjectId(auth.id) });
  if (!callerUser) {
    return denied(null, isAdmin, `Signed-in user account '${auth.id}' was not found.`);
  }

  const identifier = (targetIdentifier ?? '').trim();
  const cleanId = identifier.toLowerCase();

  if (['', 'me', 'myself', 'my', 'i'].includes(cleanId) || identifier === auth.id) {
    return selfResult(callerUser, isAdmin);
  }

  // 1. Match among the caller's linked family members (relationship word or name).
  const relationTerms = RELATION_ALIASES[cleanId] ?? [cleanId];
  for (const member of callerUser.familyMembers ?? []) {
    const linked = await users.findOne({ _id: member.userId });
    if (!linked) continue;
    const byRelation = relationTerms.includes(member.relationship.toLowerCase());
    const byName = linked.name.toLowerCase().includes(cleanId);
    if (byRelation || byName) {
      // Flags on the member's own list describe what *the caller* may do for them.
      const reverse = linked.familyMembers?.find((m) => m.userId.equals(callerUser._id));
      return {
        callerUser,
        targetUser: linked,
        relationshipWithCaller: member.relationship,
        isSelf: false,
        isAdmin,
        isLinkedFamily: true,
        canReceiveNotifications: isAdmin || Boolean(reverse?.canReceiveNotifications),
        canManageOrders: isAdmin || Boolean(reverse?.canManageOrders),
        canManageRides: isAdmin || Boolean(reverse?.canManageRides),
      };
    }
  }

  // 2. Fall back to id / phone lookup (only useful for admins or reverse links).
  let targetUser: UserDoc | null = null;
  if (ObjectId.isValid(identifier)) {
    targetUser = await users.findOne({ _id: new ObjectId(identifier) });
  }
  targetUser ??= await users.findOne({ phone: identifier });

  if (!targetUser) {
    return denied(callerUser, isAdmin, `Could not find anyone matching '${identifier}'.`);
  }

  if (targetUser._id.equals(callerUser._id)) return selfResult(callerUser, isAdmin);

  const inverse = targetUser.familyMembers?.find((m) => m.userId.equals(callerUser._id));

  return {
    callerUser,
    targetUser,
    relationshipWithCaller: inverse?.relationship ?? null,
    isSelf: false,
    isAdmin,
    isLinkedFamily: Boolean(inverse),
    canReceiveNotifications: isAdmin || Boolean(inverse?.canReceiveNotifications),
    canManageOrders: isAdmin || Boolean(inverse?.canManageOrders),
    canManageRides: isAdmin || Boolean(inverse?.canManageRides),
  };
}
