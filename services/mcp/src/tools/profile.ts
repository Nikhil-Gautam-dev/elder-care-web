import { resolveTargetUserAndAuth } from '../data/resolver.js';
import type { AuthContext } from '@eldercare/shared';

export interface ToolResult {
  success: boolean;
  user?: Record<string, unknown>;
  error?: string;
}

export async function getElderProfile(userId: string, auth?: AuthContext): Promise<ToolResult> {
  const resolved = await resolveTargetUserAndAuth(userId, auth);

  if (resolved.error || !resolved.targetUser) {
    return {
      success: false,
      error: resolved.error ?? `No profile found for '${userId}'.`,
    };
  }

  if (!resolved.isSelf && !resolved.isAdmin && !resolved.isLinkedFamily) {
    return {
      success: false,
      error: 'Access forbidden: You do not have permission to access this elder profile.',
    };
  }

  const u = resolved.targetUser;

  return {
    success: true,
    user: {
      userId: u._id.toString(),
      name: u.name,
      phone: u.phone,
      age: u.age,
      email: u.email,
      address: u.address,
      preferences: u.preferences,
      accessibility: u.accessibility,
      status: u.status,
      relationship: resolved.relationshipWithCaller ?? undefined,
    },
  };
}
