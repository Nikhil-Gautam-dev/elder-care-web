import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from '../middleware/errorHandler.js';
import { verifyPassword } from '../lib/password.js';
import { getPharmacists } from '../models/pharmacy.model.js';

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) throw createError('username and password are required', 400);

  const pharmacist = await getPharmacists().findOne({ username: username.trim().toLowerCase() });
  if (!pharmacist || !verifyPassword(password, pharmacist.passwordHash)) {
    throw createError('Incorrect username or password', 401);
  }

  const secret = process.env.PHARMACY_JWT_SECRET;
  if (!secret) throw new Error('PHARMACY_JWT_SECRET is not set');

  const token = jwt.sign(
    { id: pharmacist._id.toString(), username: pharmacist.username, name: pharmacist.name },
    secret,
    { expiresIn: process.env.PHARMACY_JWT_EXPIRES_IN ?? '12h' } as jwt.SignOptions,
  );

  res.json({
    success: true,
    data: { token, pharmacist: { username: pharmacist.username, name: pharmacist.name } },
  });
}

export function me(req: Request, res: Response): void {
  res.json({ success: true, data: req.pharmacist });
}
