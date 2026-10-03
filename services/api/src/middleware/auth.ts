import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  phone: string;
  role: 'user' | 'admin';
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: payload.id, phone: payload.phone, role: payload.role };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function requireSelf(req: Request, res: Response, next: NextFunction): void {
  const { user } = req;
  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthenticated' });
    return;
  }
  if (user.role === 'admin' || user.id === req.params['id']) {
    next();
    return;
  }
  res.status(403).json({ success: false, error: 'Forbidden — you can only access your own data' });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Forbidden — admin only' });
    return;
  }
  next();
}
