import { type Request, type Response, type NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: Record<string, unknown>;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  if (statusCode >= 500) console.error('[error]', err);

  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : (err.message ?? 'Internal server error');

  res.status(statusCode).json({ success: false, error: message, ...err.details });
}

export function createError(
  message: string,
  statusCode: number,
  details?: Record<string, unknown>,
): AppError {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  if (details) err.details = details;
  return err;
}
