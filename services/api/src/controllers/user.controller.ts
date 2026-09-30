import { type Request, type Response } from 'express';
import { ObjectId } from 'mongodb';
import { type UpdateUserBody, type UserStatus } from '@eldercare/shared';
import { isValidPinCode, normalizeIndianPhone } from '@eldercare/shared';
import { getUsersCollection, type UserDoc } from '../models/user.model.js';
import { createError } from '../middleware/errorHandler.js';

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

  const phone = normalizeIndianPhone(body['phone']);
  if (!phone) throw createError('Enter a valid 10-digit Indian mobile number', 400);

  const users = getUsersCollection();
  const existing = await users.findOne({ phone });
  if (existing) throw createError('A user with this phone number already exists', 409);

  const now = new Date();
  const doc = {
    _id: new ObjectId(),
    name: body['name'] as string,
    phone,
    age: body['age'] as number | undefined,
    email: body['email'] as string | undefined,
    address: (body['address'] as UserDoc['address']) ?? {},
    preferences: (body['preferences'] as UserDoc['preferences']) ?? {
      language: 'en',
      notificationChannel: 'sms' as const,
    },
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
    'gender',
    'email',
    'address',
    'preferences',
    'accessibility',
  ] as const;

  if (body.gender !== undefined && !['male', 'female', 'other'].includes(body.gender)) {
    throw createError('gender must be male, female or other', 400);
  }

  if (body.address?.postalCode && !isValidPinCode(body.address.postalCode)) {
    throw createError('PIN code must be exactly 6 digits', 400);
  }

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
