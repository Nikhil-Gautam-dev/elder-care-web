const BASE = '/pharmacy-api';
const TOKEN_KEY = 'pharmacy_token';

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

export type OrderStatus =
  'placed' | 'accepted' | 'packed' | 'out_for_delivery' | 'delivered' | 'rejected' | 'cancelled';

export interface OrderItem {
  catalogId: string;
  brand: string;
  generic: string;
  strength: string;
  packs: number;
  packSize: number;
  packUnit: string;
  pricePerPack: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    address: { line1: string; line2?: string; city: string; state?: string; postalCode?: string };
  };
  items: OrderItem[];
  total: number;
  paymentMethod: 'cod';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItem {
  id: string;
  brand: string;
  generic: string;
  strength: string;
  form: string;
  packSize: number;
  packUnit: string;
  pricePerPack: number;
  stockPacks: number;
  active: boolean;
}

export const login = (username: string, password: string) =>
  request<{ token: string; pharmacist: { username: string; name: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const listOrders = (status?: string) =>
  request<{ items: Order[]; total: number }>(
    `/orders?limit=100${status ? `&status=${status}` : ''}`,
  );

export const setOrderStatus = (id: string, status: OrderStatus, reason?: string) =>
  request<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });

export const searchCatalog = (q: string) =>
  request<{ items: CatalogItem[] }>(
    `/catalog?limit=50&includeInactive=true&q=${encodeURIComponent(q)}`,
  );

export const updateCatalogItem = (id: string, body: Partial<CatalogItem>) =>
  request<CatalogItem>(`/catalog/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const createCatalogItem = (body: Partial<CatalogItem>) =>
  request<CatalogItem>('/catalog', { method: 'POST', body: JSON.stringify(body) });
