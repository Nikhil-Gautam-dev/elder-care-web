import { formatIndianPhone, type AuthContext } from '@eldercare/shared';
import {
  getFamilyAliasesCollection,
  getFamilyInvitesCollection,
  getNotificationsCollection,
} from '../config/db.js';
import { loadFamilyContext, normaliseAlias } from '../data/family.js';
import { authorize, fail, isFailure, type ToolResult } from './result.js';

const MAX_ALIAS_LENGTH = 40;

/** The whole family as the caller sees it: who each person is to them, aliases, roles and permissions. */
export async function getFamilyMembers(auth?: AuthContext): Promise<ToolResult> {
  const resolved = await authorize('me', auth, 'self-only');
  if (isFailure(resolved)) return resolved;

  const ctx = await loadFamilyContext(resolved.callerUser);
  if (!ctx) return { success: true, inFamily: false, count: 0, members: [] };

  const members = ctx.members
    .filter((m) => !m.isViewer)
    .map((m) => ({
      name: m.user.name,
      isToYou: m.derived?.label ?? 'family member',
      youCallThem: m.aliases,
      phone: formatIndianPhone(m.user.phone),
      age: m.user.age,
      isElder: m.member.isElder,
      isFamilyAdmin: m.member.isAdmin,
      canReceiveNotifications: m.member.canReceiveNotifications,
      canManageOrders: m.member.canManageOrders,
      canManageRides: m.member.canManageRides,
      joinedAt: m.member.joinedAt,
    }));

  return {
    success: true,
    inFamily: true,
    familyName: ctx.family.name,
    youAreFamilyAdmin: ctx.viewer.member.isAdmin,
    youAreElder: ctx.viewer.member.isElder,
    count: members.length,
    members,
  };
}

/** Pending invites: ones my family has sent (by anyone) and ones addressed to my phone. */
export async function getPendingInvites(auth?: AuthContext): Promise<ToolResult> {
  const resolved = await authorize('me', auth, 'self-only');
  if (isFailure(resolved)) return resolved;

  const me = resolved.callerUser;
  const invites = await getFamilyInvitesCollection()
    .find({
      status: 'pending',
      expiresAt: { $gt: new Date() },
      $or: [...(me.familyId ? [{ familyId: me.familyId }] : []), { targetPhone: me.phone }],
    })
    .sort({ createdAt: -1 })
    .toArray();

  const shape = (inv: (typeof invites)[number]) => ({
    invitedBy: inv.inviterId.equals(me._id) ? 'you' : inv.inviterName,
    theyWouldBeToInviter: inv.relationship,
    expiresAt: inv.expiresAt,
    sentAt: inv.createdAt,
  });

  const receivedByMe = invites
    .filter((i) => i.targetPhone === me.phone && !i.inviterId.equals(me._id))
    .map((i) => ({ ...shape(i), fromPhone: formatIndianPhone(i.inviterPhone) }));
  const sentByMyFamily = invites
    .filter((i) => me.familyId && i.familyId.equals(me.familyId))
    .map((i) => ({
      ...shape(i),
      sentToPhone: i.targetPhone ? formatIndianPhone(i.targetPhone) : 'anyone with the invite link',
    }));

  return { success: true, sentByMyFamily, receivedByMe };
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

/** Notifies everyone in the caller's family who has notifications switched on (except the caller). */
export async function sendFamilyNotification(
  message: string,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorize('me', auth, 'self-only');
  if (isFailure(resolved)) return resolved;

  const sender = resolved.callerUser;
  const ctx = await loadFamilyContext(sender);
  if (!ctx) return fail('You are not part of a family yet, so there is nobody to notify.');

  const recipients = ctx.members.filter((m) => !m.isViewer && m.member.canReceiveNotifications);
  if (recipients.length === 0) {
    return fail('No family members are set up to receive notifications.');
  }

  const now = new Date();
  await getNotificationsCollection().insertMany(
    recipients.map((m) => ({
      recipientId: m.user._id,
      senderId: sender._id,
      senderName: sender.name,
      aboutUserId: sender._id,
      message,
      read: false,
      createdAt: now,
    })),
  );

  return { success: true, deliveredTo: recipients.map((m) => m.user.name) };
}

/** Saves a private nickname the caller uses for someone in their family ("Dadu", "beta"). */
export async function setAlias(
  person: string,
  alias: string,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorize(person, auth, 'self-or-family');
  if (isFailure(resolved)) return resolved;
  if (resolved.isSelf) return fail('An alias is for someone else in the family, not for yourself.');
  if (!resolved.family) return fail('You are not part of a family yet.');

  const name = alias.trim();
  if (!name || name.length > MAX_ALIAS_LENGTH) {
    return fail(`The alias must be between 1 and ${MAX_ALIAS_LENGTH} characters.`);
  }

  const aliasNorm = normaliseAlias(name);
  await getFamilyAliasesCollection().updateOne(
    { ownerId: resolved.callerUser._id, targetId: resolved.targetUser._id, aliasNorm },
    {
      $set: { alias: name },
      $setOnInsert: {
        familyId: resolved.family._id,
        ownerId: resolved.callerUser._id,
        targetId: resolved.targetUser._id,
        aliasNorm,
      },
    },
    { upsert: true },
  );

  return { success: true, person: resolved.targetUser.name, alias: name };
}
