export interface LatLng {
  lat?: number;
  lng?: number;
}

const num = (name: string, fallback: number): number => {
  const value = Number(process.env[name]);
  return process.env[name] && Number.isFinite(value) && value >= 0 ? value : fallback;
};

/** Great-circle distance in km. */
export function haversineKm(a: Required<LatLng>, b: Required<LatLng>): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

const hasCoords = (p: LatLng): p is Required<LatLng> =>
  typeof p.lat === 'number' && typeof p.lng === 'number';

/** Base + per-km when both places have coordinates, otherwise a flat fare (INR). */
export function estimateFare(pickup: LatLng, drop: LatLng): { fare: number; distanceKm?: number } {
  if (hasCoords(pickup) && hasCoords(drop)) {
    const distanceKm = Math.round(haversineKm(pickup, drop) * 10) / 10;
    const fare = num('RIDES_FARE_BASE', 40) + num('RIDES_FARE_PER_KM', 14) * distanceKm;
    return { fare: Math.round(fare), distanceKm };
  }
  return { fare: Math.round(num('RIDES_FARE_FLAT', 150)) };
}
