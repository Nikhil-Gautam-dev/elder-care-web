/** Thin client for the independent ElderCare Pharmacy REST API (API-key authenticated). */

export class PharmacyError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }
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
}

export interface PharmacyOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: { catalogId: string; brand: string; packs: number; packSize: number; lineTotal: number }[];
  statusHistory: { status: string; at: string; note?: string }[];
  rejectionReason?: string;
}

export interface PlaceOrderPayload {
  customer: {
    name: string;
    phone: string;
    address: { line1: string; line2?: string; city: string; state?: string; postalCode?: string };
  };
  items: { catalogItemId: string; packs: number }[];
  idempotencyKey: string;
  externalRef: Record<string, string>;
  notes?: string;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const baseUrl = process.env['PHARMACY_API_URL'] ?? 'http://localhost:3004';
  const apiKey = process.env['PHARMACY_API_KEY'];
  if (!apiKey) throw new PharmacyError('The pharmacy connection is not configured.', 500);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new PharmacyError('The pharmacy is not reachable right now.', 503);
  }

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const { error, success: _success, ...details } = payload;
    throw new PharmacyError(
      String(error ?? 'The pharmacy could not do that.'),
      response.status,
      details,
    );
  }
  return payload['data'] as T;
}

export const searchCatalog = async (query: string, limit = 15): Promise<CatalogItem[]> =>
  (
    await request<{ items: CatalogItem[] }>(
      'GET',
      `/catalog/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    )
  ).items;

export const placeOrder = (payload: PlaceOrderPayload) =>
  request<PharmacyOrder>('POST', '/orders', payload);

export const getPharmacyOrder = (id: string) => request<PharmacyOrder>('GET', `/orders/${id}`);

export const cancelPharmacyOrder = (id: string) =>
  request<PharmacyOrder>('POST', `/orders/${id}/cancel`);
