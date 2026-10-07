import { createError } from '../middleware/errorHandler.js';
import type { PlaceDoc } from '../models/rides.model.js';

interface PlaceInput {
  address?: unknown;
  lat?: unknown;
  lng?: unknown;
}

/** Validates `{ address, lat?, lng? }`; lat and lng must come together. */
export function parsePlace(input: PlaceInput | undefined, field: string): PlaceDoc {
  const address = typeof input?.address === 'string' ? input.address.trim() : '';
  if (!address) throw createError(`${field}.address is required`, 400);

  const hasLat = input?.lat !== undefined && input.lat !== null;
  const hasLng = input?.lng !== undefined && input.lng !== null;
  if (!hasLat && !hasLng) return { address };
  if (hasLat !== hasLng) throw createError(`${field}.lat and ${field}.lng go together`, 400);

  const lat = Number(input?.lat);
  const lng = Number(input?.lng);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw createError(`${field}.lat must be between -90 and 90`, 400);
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw createError(`${field}.lng must be between -180 and 180`, 400);
  }
  return { address, lat, lng };
}
