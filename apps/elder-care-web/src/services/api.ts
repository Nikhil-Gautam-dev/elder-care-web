import type {
  CreateInviteBody,
  CreateMedicationBody,
  IDoseLog,
  IMedicationView,
  IPharmacyOrder,
  LogDoseBody,
  UpdateMedicationBody,
  FamilyView,
  IUser,
  SetAliasBody,
  UpdateMemberBody,
  UpdateUserBody,
} from '@eldercare/shared';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('eldercare_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('eldercare_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('eldercare_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const body = await res.json();
  if (!res.ok || body.success === false) {
    throw new Error(body.error || body.message || 'API request failed');
  }

  return body.data !== undefined ? body.data : body;
}

export async function sendOtp(phone: string): Promise<{ message: string; otp?: string }> {
  return request<{ message: string; otp?: string }>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(
  phone: string,
  otp: string,
): Promise<{ token: string; user: { id: string; phone: string; name: string; status: string } }> {
  const data = await request<{
    token: string;
    user: { id: string; phone: string; name: string; status: string };
  }>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  });
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function getUserProfile(id: string): Promise<IUser> {
  return request<IUser>(`/users/${id}`);
}

export async function updateUserProfile(id: string, updates: UpdateUserBody): Promise<IUser> {
  return request<IUser>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/** The user's family (null when they are not in one yet). */
export async function getMyFamily(): Promise<FamilyView | null> {
  return request<FamilyView | null>('/family');
}

export async function renameFamily(name: string): Promise<void> {
  await request('/family', { method: 'PATCH', body: JSON.stringify({ name }) });
}

export async function updateFamilyMember(userId: string, body: UpdateMemberBody): Promise<void> {
  await request(`/family/members/${userId}`, { method: 'PATCH', body: JSON.stringify(body) });
}

/** Removes a member (admin) or leaves the family (when `userId` is the caller). */
export async function removeFamilyMember(userId: string): Promise<void> {
  await request(`/family/members/${userId}`, { method: 'DELETE' });
}

export async function setFamilyAlias(body: SetAliasBody): Promise<void> {
  await request('/family/aliases', { method: 'PUT', body: JSON.stringify(body) });
}

export async function deleteFamilyAlias(aliasId: string): Promise<void> {
  await request(`/family/aliases/${aliasId}`, { method: 'DELETE' });
}

export async function createFamilyInvite(
  body: CreateInviteBody,
): Promise<{ invite: any; inviteCode: string }> {
  return request<{ invite: any; inviteCode: string }>('/family/invites', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function listFamilyInvites(): Promise<{ sent: any[]; received: any[] }> {
  return request<{ sent: any[]; received: any[] }>('/family/invites');
}

export async function acceptFamilyInvite(token: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/family/invites/${token}/accept`, {
    method: 'POST',
  });
}

export async function rejectFamilyInvite(token: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/family/invites/${token}/reject`, {
    method: 'POST',
  });
}

export async function cancelFamilyInvite(token: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/family/invites/${token}/cancel`, {
    method: 'POST',
  });
}

export async function listMedications(
  elderId?: string,
  includeStopped = false,
): Promise<{ items: IMedicationView[]; canManage: boolean }> {
  const params = new URLSearchParams();
  if (elderId) params.set('elderId', elderId);
  if (includeStopped) params.set('includeStopped', 'true');
  return request<{ items: IMedicationView[]; canManage: boolean }>(`/medications?${params}`);
}

export async function createMedication(body: CreateMedicationBody): Promise<IMedicationView> {
  return request<IMedicationView>('/medications', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateMedication(
  id: string,
  body: UpdateMedicationBody,
): Promise<IMedicationView> {
  return request<IMedicationView>(`/medications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function stopMedication(id: string): Promise<void> {
  await request(`/medications/${id}`, { method: 'DELETE' });
}

/** Mark a dose as taken. `requestId` makes a retried tap harmless. */
export async function logDose(
  id: string,
  body: LogDoseBody = {},
): Promise<{ medication: IMedicationView; dose?: IDoseLog; duplicate?: boolean }> {
  return request(`/medications/${id}/doses`, { method: 'POST', body: JSON.stringify(body) });
}

export async function undoLastDose(
  id: string,
): Promise<{ medication: IMedicationView; dose: IDoseLog }> {
  return request(`/medications/${id}/doses/last`, { method: 'DELETE' });
}

export async function listDoses(id: string, limit = 5): Promise<IDoseLog[]> {
  const data = await request<{ items: IDoseLog[] }>(`/medications/${id}/doses?limit=${limit}`);
  return data.items;
}

export async function listPharmacyOrders(elderId?: string): Promise<IPharmacyOrder[]> {
  const params = elderId ? `?elderId=${encodeURIComponent(elderId)}` : '';
  const data = await request<{ items: IPharmacyOrder[] }>(`/pharmacy-orders${params}`);
  return data.items;
}
