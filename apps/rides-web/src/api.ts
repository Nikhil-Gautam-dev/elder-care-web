const BASE = '/rides-api';
const TOKEN_KEY = 'rides_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string>),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new ApiError(body.error ?? 'Something went wrong', res.status);
  }
  return body.data as T;
}

export type RideStatus =
  'requested' | 'accepted' | 'arriving' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

export interface Place {
  address: string;
  lat?: number;
  lng?: number;
}

export interface Ride {
  id: string;
  rideNumber: string;
  status: RideStatus;
  pickup: Place;
  drop: Place;
  rider: { name: string; phone: string };
  scheduledAt: string | null;
  notes?: string;
  fareEstimate: number;
  statusHistory: { status: RideStatus; at: string; note?: string }[];
  driver?: { id: string; name: string; vehicle: string; plate: string };
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  phone?: string;
  vehicle: string;
  plate: string;
  active: boolean;
}

export type DriverInput = Partial<Omit<Driver, 'id'>>;

export const login = (username: string, password: string) =>
  request<{ token: string; staff: { username: string; name: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const listRides = (status?: string) =>
  request<{ items: Ride[]; total: number }>(`/rides?limit=100${status ? `&status=${status}` : ''}`);

export const setRideStatus = (
  id: string,
  status: RideStatus,
  extra: { reason?: string; driverId?: string } = {},
) =>
  request<Ride>(`/rides/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...extra }),
  });

export const cancelRide = (id: string) =>
  request<Ride>(`/rides/${id}/cancel`, { method: 'POST', body: '{}' });

export const listDrivers = () => request<{ items: Driver[] }>('/drivers?includeInactive=true');

export const createDriver = (body: DriverInput) =>
  request<Driver>('/drivers', { method: 'POST', body: JSON.stringify(body) });

export const updateDriver = (id: string, body: DriverInput) =>
  request<Driver>(`/drivers/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
