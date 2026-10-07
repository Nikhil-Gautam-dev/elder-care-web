/** Thin client for the independent ElderCare Rides REST API (API-key authenticated). */

export class RidesError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export interface RidePlace {
  address: string;
}

export interface RidesRide {
  id: string;
  rideNumber: string;
  status: string;
  fareEstimate: number;
  scheduledAt: string | null;
  driver?: { id: string; name: string; vehicle: string; plate: string };
  rejectionReason?: string;
}

export interface FareEstimate {
  fareEstimate: number;
  currency: string;
  basis: 'distance' | 'flat';
}

export interface CreateRidePayload {
  pickup: RidePlace;
  drop: RidePlace;
  rider: { name: string; phone: string };
  scheduledAt: string | null;
  notes?: string;
  requestId: string;
  externalRef: Record<string, string>;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const baseUrl = process.env['RIDES_API_URL'] ?? 'http://localhost:3005';
  const apiKey = process.env['RIDES_API_KEY'];
  if (!apiKey) throw new RidesError('The rides connection is not configured.', 500);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new RidesError('The ride service is not reachable right now.', 503);
  }

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const { error, success: _success, ...details } = payload;
    throw new RidesError(
      String(error ?? 'The ride service could not do that.'),
      response.status,
      details,
    );
  }
  return payload['data'] as T;
}

export const estimateFare = (pickup: RidePlace, drop: RidePlace) =>
  request<FareEstimate>('POST', '/rides/fare-estimate', { pickup, drop });

export const createRide = (payload: CreateRidePayload) =>
  request<RidesRide>('POST', '/rides', payload);

export const getRide = (id: string) => request<RidesRide>('GET', `/rides/${id}`);

export const cancelRide = (id: string, note?: string) =>
  request<RidesRide>('POST', `/rides/${id}/cancel`, note ? { note } : {});
