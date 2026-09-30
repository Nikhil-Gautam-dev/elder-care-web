import type { AuthContext } from '@eldercare/shared';
import {
  getFamilyInvitesCollection,
  getNotificationsCollection,
  getUsersCollection,
} from '../config/db.js';
import { authorize, isFailure, type ToolResult } from './result.js';

export async function getFamilyMembers(
  person: string | undefined,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorize(person, auth, 'self-or-family');
  if (isFailure(resolved)) return resolved;

  const users = getUsersCollection();
  const members = await Promise.all(
    (resolved.targetUser.familyMembers ?? []).map(async (m) => {
      const linked = await users.findOne({ _id: m.userId });
      return {
        name: linked?.name ?? 'Unknown',
        relationship: m.relationship,
        phone: linked?.phone,
        canReceiveNotifications: m.canReceiveNotifications,
        canManageOrders: m.canManageOrders,
        canManageRides: m.canManageRides,
        linkedAt: m.linkedAt,
      };
    }),
  );

  return { success: true, forName: resolved.targetUser.name, count: members.length, members };
}

export async function getPendingInvites(auth?: AuthContext): Promise<ToolResult> {
  const resolved = await authorize('me', auth, 'self-only');
  if (isFailure(resolved)) return resolved;

  const me = resolved.targetUser;
  const invites = await getFamilyInvitesCollection()
    .find({
      status: 'pending',
      expiresAt: { $gt: new Date() },
      $or: [{ inviterId: me._id }, { targetPhone: me.phone }],
    })
    .sort({ createdAt: -1 })
    .toArray();

  const shape = (inv: (typeof invites)[number]) => ({
    relationship: inv.relationship,
    expiresAt: inv.expiresAt,
    sentAt: inv.createdAt,
    canReceiveNotifications: inv.canReceiveNotifications,
    canManageOrders: inv.canManageOrders,
    canManageRides: inv.canManageRides,
  });

  const sentByMe = invites
    .filter((i) => i.inviterId.equals(me._id))
    .map((i) => ({ ...shape(i), sentToPhone: i.targetPhone ?? 'anyone with the invite link' }));
  const receivedByMe = invites
    .filter((i) => !i.inviterId.equals(me._id))
    .map((i) => ({ ...shape(i), fromName: i.inviterName, fromPhone: i.inviterPhone }));

  return { success: true, sentByMe, receivedByMe };
}

export async function getNotifications(
  unreadOnly: boolean,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorize('me', auth, 'self-only');
  if (isFailure(resolved)) return resolved;

  const items = await getNotificationsCollection()
    .find({ recipientId: resolved.targetUser._id, ...(unreadOnly ? { read: false } : {}) })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  const unreadIds = items.filter((n) => !n.read).map((n) => n._id);
  if (unreadIds.length) {
    await getNotificationsCollection().updateMany(
      { _id: { $in: unreadIds } },
      { $set: { read: true } },
    );
  }

  return {
    success: true,
    count: items.length,
    notifications: items.map((n) => ({
      from: n.senderName,
      message: n.message,
      read: n.read,
      receivedAt: n.createdAt,
    })),
  };
}

export async function sendFamilyNotification(
  person: string | undefined,
  message: string,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorize(person, auth, 'self-or-family');
  if (isFailure(resolved)) return resolved;
  if (!resolved.isSelf && !resolved.isAdmin && !resolved.canReceiveNotifications) {
    return { success: false, error: "You don't have permission to notify this person's family." };
  }

  const sender = resolved.callerUser;
  if (!sender) return { success: false, error: 'Sender account not found.' };

  const users = getUsersCollection();
  const recipients = (resolved.targetUser.familyMembers ?? []).filter(
    (m) => m.canReceiveNotifications && !m.userId.equals(sender._id),
  );
  if (recipients.length === 0) {
    return { success: false, error: 'No family members are set up to receive notifications.' };
  }

  const now = new Date();
  await getNotificationsCollection().insertMany(
    recipients.map((m) => ({
      recipientId: m.userId,
      senderId: sender._id,
      senderName: sender.name,
      aboutUserId: resolved.targetUser._id,
      message,
      read: false,
      createdAt: now,
    })),
  );

  const names = (await users.find({ _id: { $in: recipients.map((m) => m.userId) } }).toArray()).map(
    (u) => u.name,
  );
  return { success: true, deliveredTo: names };
}
