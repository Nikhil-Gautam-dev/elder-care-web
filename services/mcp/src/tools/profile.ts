import { formatIndianPhone, type AuthContext } from '@eldercare/shared';
import { authorize, isFailure, type ToolResult } from './result.js';

export async function getProfile(
  person: string | undefined,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorize(person, auth, 'self-or-family');
  if (isFailure(resolved)) return resolved;

  const u = resolved.targetUser;
  return {
    success: true,
    isSelf: resolved.isSelf,
    relationshipToCaller: resolved.isSelf ? null : resolved.relationshipWithCaller,
    profile: {
      name: u.name,
      age: u.age,
      gender: u.gender,
      phone: formatIndianPhone(u.phone),
      email: u.email,
      address: u.address,
      language: u.preferences?.language,
      usualPharmacy: u.preferences?.usualPharmacy,
      preferredRide: u.preferences?.preferredRide,
      notificationChannel: u.preferences?.notificationChannel,
      largeText: u.accessibility?.largeText,
      voiceEnabled: u.accessibility?.voiceEnabled,
      status: u.status,
    },
  };
}
