import { resolveTargetUserAndAuth } from '../data/resolver.js';
import type { AuthContext } from '@eldercare/shared';

export interface ToolResult {
  success: boolean;
  userId?: string;
  usualPharmacy?: string;
  preferredRide?: string;
  notificationChannel?: string;
  error?: string;
}

export async function getMedicationPreference(
  userId: string,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await resolveTargetUserAndAuth(userId, auth);

  if (resolved.error || !resolved.targetUser) {
    return { success: false, error: resolved.error ?? `No user profile found for '${userId}'.` };
  }

  if (
    !resolved.isSelf &&
    !resolved.isAdmin &&
    !resolved.canManageOrders &&
    !resolved.isLinkedFamily
  ) {
    return {
      success: false,
      error: 'Access forbidden: You do not have permission to view medication preferences.',
    };
  }

  const prefs = resolved.targetUser.preferences;

  return {
    success: true,
    userId: resolved.targetUser._id.toString(),
    usualPharmacy: prefs?.usualPharmacy ?? 'Not specified',
    notificationChannel: prefs?.notificationChannel ?? 'app',
  };
}

export async function getRidePreference(userId: string, auth?: AuthContext): Promise<ToolResult> {
  const resolved = await resolveTargetUserAndAuth(userId, auth);

  if (resolved.error || !resolved.targetUser) {
    return { success: false, error: resolved.error ?? `No user profile found for '${userId}'.` };
  }

  if (
    !resolved.isSelf &&
    !resolved.isAdmin &&
    !resolved.canManageRides &&
    !resolved.isLinkedFamily
  ) {
    return {
      success: false,
      error: 'Access forbidden: You do not have permission to view ride preferences.',
    };
  }

  const prefs = resolved.targetUser.preferences;

  return {
    success: true,
    userId: resolved.targetUser._id.toString(),
    preferredRide: prefs?.preferredRide ?? 'standard',
  };
}
