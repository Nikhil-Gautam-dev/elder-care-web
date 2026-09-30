import { type Request, type Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  type UpdateUserBody,
  type AddFamilyMemberBody,
  type UpdateFamilyMemberBody,
  type UserStatus,
} from '@eldercare/shared';
import { getUsersCollection, type UserDoc } from '../models/user.model.js';
import { createError } from '../middleware/errorHandler.js';
import { getReciprocalRelationship } from './familyInvite.controller.js';

function toObjectId(id: string): ObjectId {
  try {
    return new ObjectId(id);
  } catch {
    throw createError(`Invalid ID: ${id}`, 400);
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>;

  if (!body['phone'] || typeof body['phone'] !== 'string') {
    throw createError('phone is required', 400);
  }
  if (!body['name'] || typeof body['name'] !== 'string') {
    throw createError('name is required', 400);
  }

  const users = getUsersCollection();
  const existing = await users.findOne({ phone: body['phone'] });
  if (existing) throw createError('A user with this phone number already exists', 409);

  const now = new Date();
  const doc = {
    _id: new ObjectId(),
    name: body['name'] as string,
    phone: body['phone'] as string,
    age: body['age'] as number | undefined,
    email: body['email'] as string | undefined,
    address: (body['address'] as UserDoc['address']) ?? {},
    preferences: (body['preferences'] as UserDoc['preferences']) ?? {
      language: 'en',
      notificationChannel: 'sms' as const,
    },
    familyMembers: [] as UserDoc['familyMembers'],
    accessibility: (body['accessibility'] as UserDoc['accessibility']) ?? {
      largeText: false,
      voiceEnabled: false,
    },
    status: 'active' as const,
    createdAt: now,
    updatedAt: now,
  };

  await users.insertOne(doc);

  res.status(201).json({
    success: true,
    data: { ...doc, _id: doc._id.toString() },
  });
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query['page'] ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query['pageSize'] ?? 20)));
  const skip = (page - 1) * pageSize;

  const validStatuses: UserStatus[] = ['active', 'inactive'];
  const statusFilter =
    typeof req.query['status'] === 'string' &&
    validStatuses.includes(req.query['status'] as UserStatus)
      ? (req.query['status'] as UserStatus)
      : undefined;

  const filter = statusFilter ? { status: statusFilter } : {};

  const users = getUsersCollection();
  const [items, total] = await Promise.all([
    users.find(filter).skip(skip).limit(pageSize).toArray(),
    users.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: items.map((u) => ({ ...u, _id: u._id.toString() })),
      total,
      page,
      pageSize,
      hasNextPage: skip + items.length < total,
      hasPreviousPage: page > 1,
    },
  });
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const _id = toObjectId(req.params['id']!);
  const users = getUsersCollection();
  const user = await users.findOne({ _id });

  if (!user) throw createError('User not found', 404);

  res.status(200).json({
    success: true,
    data: { ...user, _id: user._id.toString() },
  });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const _id = toObjectId(req.params['id']!);
  const body = req.body as UpdateUserBody;

  const allowedFields = [
    'name',
    'age',
    'email',
    'address',
    'preferences',
    'accessibility',
  ] as const;

  const $set: Record<string, unknown> = { updatedAt: new Date() };
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      $set[field] = body[field];
    }
  }

  const users = getUsersCollection();
  const result = await users.findOneAndUpdate({ _id }, { $set }, { returnDocument: 'after' });

  if (!result) throw createError('User not found', 404);

  res.status(200).json({
    success: true,
    data: { ...result, _id: result._id.toString() },
  });
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const _id = toObjectId(req.params['id']!);
  const users = getUsersCollection();

  const result = await users.findOneAndUpdate(
    { _id },
    { $set: { status: 'inactive', updatedAt: new Date() } },
    { returnDocument: 'after' },
  );

  if (!result) throw createError('User not found', 404);

  res.status(200).json({
    success: true,
    data: { message: 'User deactivated', id: _id.toString() },
  });
}

export async function getFamilyMembers(req: Request, res: Response): Promise<void> {
  const _id = toObjectId(req.params['id']!);
  const users = getUsersCollection();
  const user = await users.findOne({ _id }, { projection: { familyMembers: 1 } });

  if (!user) throw createError('User not found', 404);

  const memberIds = user.familyMembers.map((m) => m.userId);
  const memberDocs = await users
    .find({ _id: { $in: memberIds } })
    .project({ _id: 1, name: 1, phone: 1 })
    .toArray();

  const memberMap = new Map(memberDocs.map((m) => [m._id.toString(), m]));

  const enriched = user.familyMembers.map((m) => ({
    ...m,
    userId: m.userId.toString(),
    user: memberMap.get(m.userId.toString()) ?? null,
  }));

  res.status(200).json({ success: true, data: enriched });
}

export async function addFamilyMember(req: Request, res: Response): Promise<void> {
  const _id = toObjectId(req.params['id']!);
  const body = req.body as AddFamilyMemberBody;

  if (!body.userId) throw createError('userId is required', 400);
  if (!body.relationship) throw createError('relationship is required', 400);

  const memberObjectId = toObjectId(body.userId);

  const users = getUsersCollection();

  const memberUser = await users.findOne({ _id: memberObjectId });
  if (!memberUser) throw createError('Family member user not found', 404);

  if (_id.equals(memberObjectId)) throw createError('Cannot add yourself as a family member', 400);

  const user = await users.findOne({ _id });
  if (!user) throw createError('User not found', 404);

  const alreadyAdded = user.familyMembers.some((m) => m.userId.equals(memberObjectId));
  if (alreadyAdded) throw createError('This user is already a family member', 409);

  const newMember = {
    userId: memberObjectId,
    relationship: body.relationship,
    canReceiveNotifications: body.canReceiveNotifications ?? false,
    canManageOrders: body.canManageOrders ?? false,
    canManageRides: body.canManageRides ?? false,
  };

  await users.updateOne(
    { _id },
    { $push: { familyMembers: newMember }, $set: { updatedAt: new Date() } },
  );

  res.status(201).json({
    success: true,
    data: { ...newMember, userId: newMember.userId.toString() },
  });
}

export async function updateFamilyMember(req: Request, res: Response): Promise<void> {
  const _id = toObjectId(req.params['id']!);
  const memberObjectId = toObjectId(req.params['memberId']!);
  const body = req.body as UpdateFamilyMemberBody;

  const $set: Record<string, unknown> = { updatedAt: new Date() };

  if (body.relationship !== undefined) $set['familyMembers.$.relationship'] = body.relationship;
  if (body.canReceiveNotifications !== undefined)
    $set['familyMembers.$.canReceiveNotifications'] = body.canReceiveNotifications;
  if (body.canManageOrders !== undefined)
    $set['familyMembers.$.canManageOrders'] = body.canManageOrders;
  if (body.canManageRides !== undefined)
    $set['familyMembers.$.canManageRides'] = body.canManageRides;

  const users = getUsersCollection();
  const result = await users.findOneAndUpdate(
    { _id, 'familyMembers.userId': memberObjectId },
    { $set },
    { returnDocument: 'after' },
  );

  if (!result) throw createError('User or family member not found', 404);

  if (body.relationship !== undefined) {
    const reciprocal = getReciprocalRelationship(body.relationship);
    await users.updateOne(
      { _id: memberObjectId, 'familyMembers.userId': _id },
      { $set: { 'familyMembers.$.relationship': reciprocal, updatedAt: new Date() } },
    );
  }

  const updated = result.familyMembers.find((m) => m.userId.equals(memberObjectId));

  res.status(200).json({
    success: true,
    data: updated ? { ...updated, userId: updated.userId.toString() } : null,
  });
}

export async function removeFamilyMember(req: Request, res: Response): Promise<void> {
  const _id = toObjectId(req.params['id']!);
  const memberObjectId = toObjectId(req.params['memberId']!);

  const users = getUsersCollection();
  const result = await users.findOneAndUpdate(
    { _id },
    {
      $pull: { familyMembers: { userId: memberObjectId } },
      $set: { updatedAt: new Date() },
    },
    { returnDocument: 'before' },
  );

  if (!result) throw createError('User not found', 404);

  const wasPresent = result.familyMembers.some((m) => m.userId.equals(memberObjectId));
  if (!wasPresent) throw createError('Family member not found', 404);

  res.status(200).json({
    success: true,
    data: { message: 'Family member removed', memberId: memberObjectId.toString() },
  });
}
