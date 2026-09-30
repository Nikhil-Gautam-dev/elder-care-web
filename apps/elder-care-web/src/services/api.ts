import type { CreateInviteBody, IUser, UpdateUserBody } from '@eldercare/shared';

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

export async function getFamilyMembers(userId: string): Promise<any[]> {
  return request<any[]>(`/users/${userId}/family`);
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
