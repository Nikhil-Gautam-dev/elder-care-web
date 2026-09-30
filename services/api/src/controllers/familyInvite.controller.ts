import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import type { CreateInviteBody, FamilyRelationship } from '@eldercare/shared';
import { createError } from '../middleware/errorHandler.js';
import { getFamilyInvitesCollection, getUsersCollection } from '../models/user.model.js';

export function getReciprocalRelationship(rel: FamilyRelationship): FamilyRelationship {
  switch (rel) {
    case 'son':
    case 'daughter':
    case 'child':
      return 'parent';
    case 'parent':
      return 'child';
    case 'spouse':
      return 'spouse';
    case 'sibling':
      return 'sibling';
    case 'caregiver':
      return 'other';
    default:
      return 'other';
  }
}

export async function createInvite(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    throw createError('Unauthorized', 401);
  }

  const body = req.body as CreateInviteBody;
  if (!body.relationship) {
    throw createError('Relationship is required', 400);
  }

  const usersCollection = getUsersCollection();
  const inviter = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!inviter) {
    throw createError('Inviter account not found', 404);
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const inviteDoc = {
    _id: new ObjectId(),
    inviterId: inviter._id,
    inviterName: inviter.name,
    inviterPhone: inviter.phone,
    targetPhone: body.targetPhone ? body.targetPhone.trim() : undefined,
    relationship: body.relationship,
    canReceiveNotifications: body.canReceiveNotifications ?? true,
    canManageOrders: body.canManageOrders ?? true,
    canManageRides: body.canManageRides ?? true,
    token,
    status: 'pending' as const,
    expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const invitesCollection = getFamilyInvitesCollection();
  await invitesCollection.insertOne(inviteDoc);

  res.status(201).json({
    message: 'Invite created successfully',
    invite: {
      ...inviteDoc,
      _id: inviteDoc._id.toString(),
      inviterId: inviteDoc.inviterId.toString(),
    },
    inviteCode: token,
  });
}

export async function getInviteByToken(req: Request, res: Response): Promise<void> {
  const { token } = req.params;
  if (!token) {
    throw createError('Token parameter is required', 400);
  }

  const invitesCollection = getFamilyInvitesCollection();
  const invite = await invitesCollection.findOne({ token });

  if (!invite) {
    throw createError('Invite not found', 404);
  }

  if (invite.expiresAt < new Date() && invite.status === 'pending') {
    await invitesCollection.updateOne({ _id: invite._id }, { $set: { status: 'expired' } });
    invite.status = 'expired';
  }

  res.json({
    invite: {
      id: invite._id.toString(),
      inviterName: invite.inviterName,
      relationship: invite.relationship,
      status: invite.status,
      expiresAt: invite.expiresAt,
    },
  });
}

export async function acceptInvite(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    throw createError('Unauthorized', 401);
  }

  const { token } = req.params;
  if (!token) {
    throw createError('Token parameter is required', 400);
  }

  const usersCollection = getUsersCollection();
  const acceptor = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!acceptor) {
    throw createError('User account not found', 404);
  }

  const invitesCollection = getFamilyInvitesCollection();
  const invite = await invitesCollection.findOne({ token });

  if (!invite) {
    throw createError('Invite not found', 404);
  }

  if (invite.status !== 'pending') {
    throw createError(`Invite is already ${invite.status}`, 400);
  }

  if (invite.expiresAt < new Date()) {
    await invitesCollection.updateOne({ _id: invite._id }, { $set: { status: 'expired' } });
    throw createError('Invite has expired', 400);
  }

  if (invite.inviterId.toString() === userId) {
    throw createError('Cannot accept your own invite', 400);
  }

  if (invite.targetPhone && invite.targetPhone !== acceptor.phone) {
    throw createError('This invite was issued for a different phone number', 403);
  }

  const alreadyLinked = acceptor.familyMembers.some(
    (member) => member.userId.toString() === invite.inviterId.toString(),
  );
  if (alreadyLinked) {
    throw createError('Users are already linked as family members', 400);
  }

  const updatedInvite = await invitesCollection.findOneAndUpdate(
    { _id: invite._id, status: 'pending' },
    { $set: { status: 'accepted', updatedAt: new Date() } },
    { returnDocument: 'after' },
  );

  if (!updatedInvite) {
    throw createError('Invite was modified or accepted by another concurrent request', 409);
  }

  const now = new Date();

  await usersCollection.updateOne(
    { _id: invite.inviterId },
    {
      $push: {
        familyMembers: {
          userId: acceptor._id,
          relationship: invite.relationship,
          canReceiveNotifications: invite.canReceiveNotifications,
          canManageOrders: invite.canManageOrders,
          canManageRides: invite.canManageRides,
          inviteId: invite._id,
          linkedAt: now,
        },
      },
      $set: { updatedAt: now },
    },
  );

  const reciprocalRel = getReciprocalRelationship(invite.relationship as FamilyRelationship);
  await usersCollection.updateOne(
    { _id: acceptor._id },
    {
      $push: {
        familyMembers: {
          userId: invite.inviterId,
          relationship: reciprocalRel,
          canReceiveNotifications: true,
          canManageOrders: true,
          canManageRides: true,
          inviteId: invite._id,
          linkedAt: now,
        },
      },
      $set: { updatedAt: now },
    },
  );

  res.json({
    message: 'Family invite accepted successfully',
    inviteId: invite._id.toString(),
    linkedUser: {
      id: invite.inviterId.toString(),
      name: invite.inviterName,
      relationship: reciprocalRel,
    },
  });
}

export async function rejectInvite(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    throw createError('Unauthorized', 401);
  }

  const { token } = req.params;
  const invitesCollection = getFamilyInvitesCollection();
  const invite = await invitesCollection.findOne({ token });

  if (!invite) {
    throw createError('Invite not found', 404);
  }

  if (invite.status !== 'pending') {
    throw createError(`Invite is already ${invite.status}`, 400);
  }

  await invitesCollection.updateOne(
    { _id: invite._id },
    { $set: { status: 'rejected', updatedAt: new Date() } },
  );

  res.json({ message: 'Invite rejected successfully' });
}

export async function cancelInvite(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    throw createError('Unauthorized', 401);
  }

  const { token } = req.params;
  const invitesCollection = getFamilyInvitesCollection();
  const invite = await invitesCollection.findOne({ token });

  if (!invite) {
    throw createError('Invite not found', 404);
  }

  if (invite.inviterId.toString() !== userId) {
    throw createError('Only the inviter can cancel this invite', 403);
  }

  if (invite.status !== 'pending') {
    throw createError(`Invite is already ${invite.status}`, 400);
  }

  await invitesCollection.updateOne(
    { _id: invite._id },
    { $set: { status: 'cancelled', updatedAt: new Date() } },
  );

  res.json({ message: 'Invite cancelled successfully' });
}

export async function listUserInvites(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    throw createError('Unauthorized', 401);
  }

  const usersCollection = getUsersCollection();
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    throw createError('User not found', 404);
  }

  const invitesCollection = getFamilyInvitesCollection();
  const sentDocs = await invitesCollection
    .find({ inviterId: user._id })
    .sort({ createdAt: -1 })
    .toArray();

  const receivedDocs = await invitesCollection
    .find({ targetPhone: user.phone, status: 'pending' })
    .sort({ createdAt: -1 })
    .toArray();

  res.json({
    sent: sentDocs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      inviterId: doc.inviterId.toString(),
    })),
    received: receivedDocs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      inviterId: doc.inviterId.toString(),
    })),
  });
}
