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

export async function resolveTargetUserAndAuth(
  targetIdentifier: string,
  auth?: AuthContext,
): Promise<ResolvedUserResult> {
  const users = getUsersCollection();

  let callerUser: UserDoc | null = null;
  if (auth?.id && ObjectId.isValid(auth.id)) {
    callerUser = await users.findOne({ _id: new ObjectId(auth.id) });
  }

  const isAdmin = auth?.role === 'admin';
  const cleanId = targetIdentifier.trim().toLowerCase();

  if (cleanId === 'me' || cleanId === '' || (auth?.id && auth.id === targetIdentifier)) {
    if (!callerUser) {
      if (auth?.id) {
        return {
          callerUser: null,
          targetUser: null,
          relationshipWithCaller: 'self',
          isSelf: true,
          isAdmin,
          isLinkedFamily: false,
          canReceiveNotifications: true,
          canManageOrders: true,
          canManageRides: true,
          error: `Authenticated user profile '${auth.id}' not found in database.`,
        };
      }
      const fallbackUser = await users.findOne({});
      if (!fallbackUser) {
        return {
          callerUser: null,
          targetUser: null,
          relationshipWithCaller: null,
          isSelf: true,
          isAdmin,
          isLinkedFamily: false,
          canReceiveNotifications: true,
          canManageOrders: true,
          canManageRides: true,
          error: 'No user profile found in database.',
        };
      }
      return {
        callerUser: fallbackUser,
        targetUser: fallbackUser,
        relationshipWithCaller: 'self',
        isSelf: true,
        isAdmin,
        isLinkedFamily: false,
        canReceiveNotifications: true,
        canManageOrders: true,
        canManageRides: true,
      };
    }
    return {
      callerUser,
      targetUser: callerUser,
      relationshipWithCaller: 'self',
      isSelf: true,
      isAdmin,
      isLinkedFamily: false,
      canReceiveNotifications: true,
      canManageOrders: true,
      canManageRides: true,
    };
  }

  if (callerUser && callerUser.familyMembers?.length) {
    const aliasMap: Record<string, string[]> = {
      mom: ['mother', 'mom', 'parent'],
      dad: ['father', 'dad', 'parent'],
      son: ['son', 'child'],
      daughter: ['daughter', 'child'],
    };

    const searchTerms = aliasMap[cleanId] ?? [cleanId];

    for (const member of callerUser.familyMembers) {
      if (searchTerms.includes(member.relationship.toLowerCase())) {
        const targetUser = await users.findOne({ _id: member.userId });
        if (targetUser) {
          return {
            callerUser,
            targetUser,
            relationshipWithCaller: member.relationship,
            isSelf: false,
            isAdmin,
            isLinkedFamily: true,
            canReceiveNotifications: member.canReceiveNotifications,
            canManageOrders: member.canManageOrders,
            canManageRides: member.canManageRides,
          };
        }
      }
    }
  }

  let targetUser: UserDoc | null = null;
  if (ObjectId.isValid(targetIdentifier)) {
    targetUser = await users.findOne({ _id: new ObjectId(targetIdentifier) });
  }

  if (!targetUser) {
    targetUser = await users.findOne({
      $or: [{ name: { $regex: targetIdentifier, $options: 'i' } }, { phone: targetIdentifier }],
    });
  }

  if (!targetUser) {
    return {
      callerUser,
      targetUser: null,
      relationshipWithCaller: null,
      isSelf: false,
      isAdmin,
      isLinkedFamily: false,
      canReceiveNotifications: false,
      canManageOrders: false,
      canManageRides: false,
      error: `User matching '${targetIdentifier}' not found.`,
    };
  }

  const isSelf = Boolean(callerUser && callerUser._id.equals(targetUser._id));

  let isLinkedFamily = false;
  let canReceiveNotifications = false;
  let canManageOrders = false;
  let canManageRides = false;
  let relationshipWithCaller: string | null = null;

  if (callerUser) {
    const linkedMember = callerUser.familyMembers?.find((m) => m.userId.equals(targetUser._id));
    if (linkedMember) {
      isLinkedFamily = true;
      relationshipWithCaller = linkedMember.relationship;
      canReceiveNotifications = linkedMember.canReceiveNotifications;
      canManageOrders = linkedMember.canManageOrders;
      canManageRides = linkedMember.canManageRides;
    } else {
      const inverseLink = targetUser.familyMembers?.find((m) => m.userId.equals(callerUser!._id));
      if (inverseLink) {
        isLinkedFamily = true;
        relationshipWithCaller = inverseLink.relationship;
        canReceiveNotifications = inverseLink.canReceiveNotifications;
        canManageOrders = inverseLink.canManageOrders;
        canManageRides = inverseLink.canManageRides;
      }
    }
  }

  return {
    callerUser,
    targetUser,
    relationshipWithCaller,
    isSelf,
    isAdmin,
    isLinkedFamily,
    canReceiveNotifications: isSelf || isAdmin || canReceiveNotifications,
    canManageOrders: isSelf || isAdmin || canManageOrders,
    canManageRides: isSelf || isAdmin || canManageRides,
  };
}
