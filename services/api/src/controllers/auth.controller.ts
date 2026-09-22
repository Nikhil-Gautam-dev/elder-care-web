import { type Request, type Response } from 'express';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { getOtpsCollection, getUsersCollection } from '../models/user.model.js';
import { createError } from '../middleware/errorHandler.js';

function generateOtp(): string {
  return Math.floor(100_000 + Math.random() * 900_000).toString();
}

function getOtpTtl(): number {
  return Number(process.env.OTP_EXPIRES_IN_SECONDS ?? 300);
}

export async function sendOtp(req: Request, res: Response): Promise<void> {
  const { phone } = req.body as { phone?: string };
  if (!phone) throw createError('phone is required', 400);

  const ttl = getOtpTtl();
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + ttl * 1000);

  const otps = getOtpsCollection();

  await otps.deleteMany({ phone });

  await otps.insertOne({
    _id: new ObjectId(),
    phone,
    code,
    expiresAt,
    createdAt: new Date(),
  });

  console.info(`[otp] Generated OTP for ${phone}: ${code} (expires in ${ttl}s)`);

  const devMode = process.env.OTP_DEV_MODE === 'true';

  res.status(200).json({
    success: true,
    data: {
      message: `OTP sent to ${phone}`,
      expiresInSeconds: ttl,
      ...(devMode ? { otp: code } : {}),
    },
  });
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  const { phone, otp } = req.body as { phone?: string; otp?: string };
  if (!phone || !otp) throw createError('phone and otp are required', 400);

  const otps = getOtpsCollection();
  const record = await otps.findOne({ phone, code: otp });

  if (!record) throw createError('Invalid OTP', 401);
  if (record.expiresAt < new Date()) {
    await otps.deleteOne({ _id: record._id });
    throw createError('OTP has expired', 401);
  }

  await otps.deleteOne({ _id: record._id });

  const users = getUsersCollection();
  const now = new Date();

  const result = await users.findOneAndUpdate(
    { phone },
    {
      $setOnInsert: {
        _id: new ObjectId(),
        phone,
        name: '',
        preferences: {
          language: 'en',
          notificationChannel: 'sms',
        },
        familyMembers: [],
        accessibility: { largeText: false, voiceEnabled: false },
        status: 'active',
        createdAt: now,
      },
      $set: { updatedAt: now },
    },
    { upsert: true, returnDocument: 'after' },
  );

  if (!result) throw createError('Failed to find or create user', 500);

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');

  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

  const token = jwt.sign({ id: result._id.toString(), phone: result.phone, role: 'user' }, secret, {
    expiresIn,
  } as jwt.SignOptions);

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: result._id.toString(),
        phone: result.phone,
        name: result.name,
        status: result.status,
      },
    },
  });
}
