import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from '../middleware/errorHandler.js';
import { verifyPassword } from '../lib/password.js';
import { getStaff } from '../models/rides.model.js';

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) throw createError('username and password are required', 400);

  const staff = await getStaff().findOne({ username: username.trim().toLowerCase() });
  if (!staff || !verifyPassword(password, staff.passwordHash)) {
    throw createError('Incorrect username or password', 401);
  }

  const secret = process.env.RIDES_JWT_SECRET;
  if (!secret) throw new Error('RIDES_JWT_SECRET is not set');

  const token = jwt.sign(
    { id: staff._id.toString(), username: staff.username, name: staff.name },
    secret,
    {
      expiresIn: process.env.RIDES_JWT_EXPIRES_IN ?? '12h',
    } as jwt.SignOptions,
  );

  res.json({
    success: true,
    data: { token, staff: { username: staff.username, name: staff.name } },
  });
}

export function me(req: Request, res: Response): void {
  res.json({ success: true, data: req.staff });
}
