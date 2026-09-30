import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  edgeFromInvite,
  normalizeIndianPhone,
  type CreateInviteBody,
  type FamilyRelationship,
} from '@eldercare/shared';
import { createError } from '../middleware/errorHandler.js';
import {
  getFamiliesCollection,
  getFamilyInvitesCollection,
  getUsersCollection,
  type FamilyDoc,
  type FamilyInviteDoc,
} from '../models/user.model.js';

const INVITE_TTL_MS = 48 * 60 * 60 * 1000;
const RELATIONSHIPS: FamilyRelationship[] = [
  'son',
  'daughter',
  'child',
  'spouse',
  'parent',
  'sibling',
  'caregiver',
  'other',
];

function requireUserId(req: Request): string {
  const userId = req.user?.id;
  if (!userId) throw createError('Unauthorized', 401);
  return userId;
}

const serializeInvite = (doc: FamilyInviteDoc) => ({
  ...doc,
  _id: doc._id.toString(),
  inviterId: doc.inviterId.toString(),
  familyId: doc.familyId.toString(),
});

/** Any family member can invite; the family is created the first time someone invites. */
export async function createInvite(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);

  const body = req.body as CreateInviteBody;
  if (!body.relationship || !RELATIONSHIPS.includes(body.relationship)) {
    throw createError(`relationship is required (one of ${RELATIONSHIPS.join(', ')})`, 400);
  }

  let targetPhone: string | undefined;
  if (body.targetPhone?.trim()) {
    const normalised = normalizeIndianPhone(body.targetPhone);
    if (!normalised) throw createError('Enter a valid 10-digit Indian mobile number', 400);
    targetPhone = normalised;
  }

  const users = getUsersCollection();
  const inviter = await users.findOne({ _id: new ObjectId(userId) });
  if (!inviter) throw createError('Inviter account not found', 404);

  const families = getFamiliesCollection();
  let familyId = inviter.familyId;

  if (!familyId) {
    const now = new Date();
    const family: FamilyDoc = {
      _id: new ObjectId(),
      name: inviter.name ? `${inviter.name}'s family` : 'My family',
      createdBy: inviter._id,
      createdAt: now,
      members: [
        {
          userId: inviter._id,
          isAdmin: true,
          isElder: true,
          canReceiveNotifications: true,
          canManageOrders: true,
          canManageRides: true,
          joinedAt: now,
        },
      ],
      relations: [],
    };
    await families.insertOne(family);
    // Guard against two concurrent first invites creating two families.
    const claimed = await users.updateOne(
      { _id: inviter._id, familyId: { $exists: false } },
      { $set: { familyId: family._id, updatedAt: now } },
    );
    if (claimed.modifiedCount === 0) {
      await families.deleteOne({ _id: family._id });
      familyId = (await users.findOne({ _id: inviter._id }))?.familyId;
    } else {
      familyId = family._id;
    }
  }

  if (!familyId) throw createError('Could not determine family', 500);

  const now = new Date();
  const token = crypto.randomBytes(32).toString('hex');
  const invite: FamilyInviteDoc = {
    _id: new ObjectId(),
    inviterId: inviter._id,
    inviterName: inviter.name,
    inviterPhone: inviter.phone,
    familyId,
    targetPhone,
    relationship: body.relationship,
    isElder: body.isElder ?? false,
    canReceiveNotifications: body.canReceiveNotifications ?? true,
    canManageOrders: body.canManageOrders ?? true,
    canManageRides: body.canManageRides ?? true,
    token,
    status: 'pending',
    expiresAt: new Date(now.getTime() + INVITE_TTL_MS),
    createdAt: now,
    updatedAt: now,
  };
  await getFamilyInvitesCollection().insertOne(invite);

  res.status(201).json({
    message: 'Invite created successfully',
    invite: serializeInvite(invite),
    inviteCode: token,
  });
}

export async function getInviteByToken(req: Request, res: Response): Promise<void> {
  const { token } = req.params;
  if (!token) throw createError('Token parameter is required', 400);

  const invites = getFamilyInvitesCollection();
  const invite = await invites.findOne({ token });
  if (!invite) throw createError('Invite not found', 404);

  if (invite.expiresAt < new Date() && invite.status === 'pending') {
    await invites.updateOne({ _id: invite._id }, { $set: { status: 'expired' } });
    invite.status = 'expired';
  }

  const family = await getFamiliesCollection().findOne({ _id: invite.familyId });

  res.json({
    invite: {
      id: invite._id.toString(),
      inviterName: invite.inviterName,
      familyName: family?.name,
      relationship: invite.relationship,
      status: invite.status,
      expiresAt: invite.expiresAt,
    },
  });
}

export async function acceptInvite(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const { token } = req.params;
  if (!token) throw createError('Token parameter is required', 400);

  const users = getUsersCollection();
  const acceptor = await users.findOne({ _id: new ObjectId(userId) });
  if (!acceptor) throw createError('User account not found', 404);

  const invites = getFamilyInvitesCollection();
  const invite = await invites.findOne({ token });
  if (!invite) throw createError('Invite not found', 404);

  if (invite.status !== 'pending') throw createError(`Invite is already ${invite.status}`, 400);

  if (invite.expiresAt < new Date()) {
    await invites.updateOne({ _id: invite._id }, { $set: { status: 'expired' } });
    throw createError('Invite has expired', 400);
  }

  if (
    invite.targetPhone &&
    invite.targetPhone !== (normalizeIndianPhone(acceptor.phone) ?? acceptor.phone)
  ) {
    throw createError('This invite was issued for a different phone number', 403);
  }

  if (acceptor.familyId) {
    throw createError(
      acceptor.familyId.equals(invite.familyId)
        ? 'You are already in this family'
        : 'You already belong to a family — leave it before joining another',
      409,
    );
  }

  const families = getFamiliesCollection();
  const family = await families.findOne({ _id: invite.familyId });
  if (!family) throw createError('This family no longer exists', 410);
  if (!family.members.some((m) => m.userId.equals(invite.inviterId))) {
    throw createError('The person who invited you has left the family', 410);
  }

  const claimed = await invites.findOneAndUpdate(
    { _id: invite._id, status: 'pending' },
    { $set: { status: 'accepted', updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
  if (!claimed)
    throw createError('Invite was modified or accepted by another concurrent request', 409);

  const now = new Date();
  const edge = edgeFromInvite(
    invite.relationship as FamilyRelationship,
    invite.inviterId.toString(),
    acceptor._id.toString(),
  );

  await families.updateOne(
    { _id: family._id },
    {
      $push: {
        members: {
          userId: acceptor._id,
          isAdmin: false,
          isElder: invite.isElder,
          canReceiveNotifications: invite.canReceiveNotifications,
          canManageOrders: invite.canManageOrders,
          canManageRides: invite.canManageRides,
          joinedAt: now,
        },
        ...(edge
          ? { relations: { kind: edge.kind, a: new ObjectId(edge.a), b: new ObjectId(edge.b) } }
          : {}),
      },
    },
  );
  await users.updateOne({ _id: acceptor._id }, { $set: { familyId: family._id, updatedAt: now } });

  res.json({
    message: 'Family invite accepted successfully',
    inviteId: invite._id.toString(),
    family: { id: family._id.toString(), name: family.name },
  });
}

export async function rejectInvite(req: Request, res: Response): Promise<void> {
  requireUserId(req);
  const { token } = req.params;

  const invites = getFamilyInvitesCollection();
  const invite = await invites.findOne({ token });
  if (!invite) throw createError('Invite not found', 404);
  if (invite.status !== 'pending') throw createError(`Invite is already ${invite.status}`, 400);

  await invites.updateOne(
    { _id: invite._id },
    { $set: { status: 'rejected', updatedAt: new Date() } },
  );
  res.json({ message: 'Invite rejected successfully' });
}

/** The inviter or any admin of the invite's family can cancel. */
export async function cancelInvite(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const { token } = req.params;

  const invites = getFamilyInvitesCollection();
  const invite = await invites.findOne({ token });
  if (!invite) throw createError('Invite not found', 404);

  const family = await getFamiliesCollection().findOne({ _id: invite.familyId });
  const isFamilyAdmin = family?.members.some((m) => m.isAdmin && m.userId.toString() === userId);
  if (invite.inviterId.toString() !== userId && !isFamilyAdmin) {
    throw createError('Only the inviter or a family admin can cancel this invite', 403);
  }
  if (invite.status !== 'pending') throw createError(`Invite is already ${invite.status}`, 400);

  await invites.updateOne(
    { _id: invite._id },
    { $set: { status: 'cancelled', updatedAt: new Date() } },
  );
  res.json({ message: 'Invite cancelled successfully' });
}

/** `sent`: invites from anyone in my family. `received`: pending invites addressed to my phone. */
export async function listUserInvites(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);

  const user = await getUsersCollection().findOne({ _id: new ObjectId(userId) });
  if (!user) throw createError('User not found', 404);

  const invites = getFamilyInvitesCollection();
  const sent = user.familyId
    ? await invites.find({ familyId: user.familyId }).sort({ createdAt: -1 }).toArray()
    : [];
  const received = await invites
    .find({ targetPhone: user.phone, status: 'pending', expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .toArray();

  res.json({ sent: sent.map(serializeInvite), received: received.map(serializeInvite) });
}
