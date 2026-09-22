import { resolveTargetUserAndAuth } from '../data/resolver.js';
import { getUsersCollection, getFamilyInvitesCollection } from '../config/db.js';
import type { AuthContext } from '@eldercare/shared';

export interface ToolResult {
  success: boolean;
  count?: number;
  familyMembers?: Record<string, unknown>[];
  notificationId?: string;
  message?: string;
  deliveredTo?: Record<string, unknown>[];
  pendingInvites?: Record<string, unknown>[];
  error?: string;
}

export async function getFamilyMembers(userId: string, auth?: AuthContext): Promise<ToolResult> {
  const resolved = await resolveTargetUserAndAuth(userId, auth);

  if (resolved.error || !resolved.targetUser) {
    return {
      success: false,
      error: resolved.error ?? `No user found for '${userId}'.`,
    };
  }

  if (!resolved.isSelf && !resolved.isAdmin && !resolved.isLinkedFamily) {
    return {
      success: false,
      error: 'Access forbidden: You do not have permission to view family members for this user.',
    };
  }

  const users = getUsersCollection();
  const members = resolved.targetUser.familyMembers ?? [];

  const familyDetails: Record<string, unknown>[] = [];
  for (const m of members) {
    const linkedUser = await users.findOne({ _id: m.userId });
    familyDetails.push({
      memberId: m.userId.toString(),
      name: linkedUser?.name ?? 'Unknown User',
      relationship: m.relationship,
      phone: linkedUser?.phone ?? 'N/A',
      canReceiveNotifications: m.canReceiveNotifications,
      canManageOrders: m.canManageOrders,
      canManageRides: m.canManageRides,
      linkedAt: m.linkedAt ?? new Date(),
    });
  }

  return {
    success: true,
    count: familyDetails.length,
    familyMembers: familyDetails,
  };
}

export async function sendFamilyNotification(
  userId: string,
  message: string,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await resolveTargetUserAndAuth(userId, auth);

  if (resolved.error || !resolved.targetUser) {
    return {
      success: false,
      error: resolved.error ?? `No user found for '${userId}'.`,
    };
  }

  if (!resolved.isSelf && !resolved.isAdmin && !resolved.canReceiveNotifications) {
    return {
      success: false,
      error:
        'Access forbidden: You do not have notification permission for this user family group.',
    };
  }

  const users = getUsersCollection();
  const members = resolved.targetUser.familyMembers ?? [];

  const notified: Record<string, unknown>[] = [];
  for (const m of members) {
    if (m.canReceiveNotifications) {
      const linkedUser = await users.findOne({ _id: m.userId });
      notified.push({
        name: linkedUser?.name ?? 'Family Member',
        relationship: m.relationship,
        phone: linkedUser?.phone,
        channel: linkedUser?.preferences?.notificationChannel ?? 'whatsapp',
      });
    }
  }

  if (notified.length === 0) {
    return {
      success: false,
      error: 'No family members found with active notification permissions.',
    };
  }

  return {
    success: true,
    notificationId: `NOTIF-${Math.floor(Math.random() * 100000)}`,
    message,
    deliveredTo: notified,
  };
}

export async function getPendingInvites(userId: string, auth?: AuthContext): Promise<ToolResult> {
  const resolved = await resolveTargetUserAndAuth(userId, auth);

  if (resolved.error || !resolved.targetUser) {
    return {
      success: false,
      error: resolved.error ?? `No user found for '${userId}'.`,
    };
  }

  if (!resolved.isSelf && !resolved.isAdmin) {
    return {
      success: false,
      error: 'Access forbidden: You can only view your own pending family invitations.',
    };
  }

  const invitesColl = getFamilyInvitesCollection();
  const invites = await invitesColl
    .find({
      $or: [{ inviterId: resolved.targetUser._id }, { targetPhone: resolved.targetUser.phone }],
      status: 'pending',
    })
    .toArray();

  const formatted = invites.map((inv) => ({
    inviteId: inv._id.toString(),
    inviterName: inv.inviterName,
    inviterPhone: inv.inviterPhone,
    targetPhone: inv.targetPhone,
    relationship: inv.relationship,
    canReceiveNotifications: inv.canReceiveNotifications,
    canManageOrders: inv.canManageOrders,
    canManageRides: inv.canManageRides,
    status: inv.status,
    expiresAt: inv.expiresAt,
  }));

  return {
    success: true,
    count: formatted.length,
    pendingInvites: formatted,
    message: formatted.length === 0 ? 'No pending family invitations found.' : undefined,
  };
}
