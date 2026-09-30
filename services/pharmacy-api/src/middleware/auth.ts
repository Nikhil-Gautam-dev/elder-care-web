import crypto from 'node:crypto';
import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface PharmacistToken {
  id: string;
  username: string;
  name: string;
}

const unauthorized = (res: Response, error: string) =>
  res.status(401).json({ success: false, error });

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function hasValidApiKey(req: Request): boolean {
  const expected = process.env.PHARMACY_API_KEY;
  const provided = req.headers['x-api-key'];
  if (!expected) throw new Error('PHARMACY_API_KEY is not set');
  return typeof provided === 'string' && safeEqual(provided, expected);
}

function readPharmacist(req: Request): PharmacistToken | null {
  const header = req.headers.authorization;
  const secret = process.env.PHARMACY_JWT_SECRET;
  if (!secret) throw new Error('PHARMACY_JWT_SECRET is not set');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.slice(7), secret) as PharmacistToken;
  } catch {
    return null;
  }
}

/** Partner systems (ElderCare MCP) authenticate with the X-API-Key header. */
export function requirePartner(req: Request, res: Response, next: NextFunction): void {
  if (!hasValidApiKey(req)) {
    unauthorized(res, 'Missing or invalid API key');
    return;
  }
  req.isPartner = true;
  next();
}

/** Pharmacy staff authenticate with a JWT from POST /auth/login. */
export function requirePharmacist(req: Request, res: Response, next: NextFunction): void {
  const pharmacist = readPharmacist(req);
  if (!pharmacist) {
    unauthorized(res, 'Pharmacist login required');
    return;
  }
  req.pharmacist = pharmacist;
  next();
}

/** Either a pharmacist (UI) or a partner system (API key). */
export function requirePartnerOrPharmacist(req: Request, res: Response, next: NextFunction): void {
  const pharmacist = readPharmacist(req);
  if (pharmacist) {
    req.pharmacist = pharmacist;
    next();
    return;
  }
  if (hasValidApiKey(req)) {
    req.isPartner = true;
    next();
    return;
  }
  unauthorized(res, 'Pharmacist login or a valid API key is required');
}
