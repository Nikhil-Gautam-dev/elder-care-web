import {
  deliveryAddressGaps,
  formatAddress,
  formatIndianPhone,
  isValidPinCode,
  type AuthContext,
} from '@eldercare/shared';
import { getUsersCollection } from '../config/db.js';
import { authorize, fail, isFailure, type ToolResult } from './result.js';

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
      address: formatAddress(u.address) || undefined,
      addressMissing: deliveryAddressGaps(u.address),
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

export interface AddressArgs {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
}

/** Saves the signed-in user's own home address (used for medicine delivery). */
export async function setAddress(args: AddressArgs, auth?: AuthContext): Promise<ToolResult> {
  const resolved = await authorize('me', auth, 'self-only');
  if (isFailure(resolved)) return resolved;

  const line1 = args.line1?.trim();
  const city = args.city?.trim();
  if (!line1) return fail('The house number and street are needed.');
  if (!city) return fail('The city is needed.');
  if (line1.length > 120 || (args.line2 ?? '').length > 120)
    return fail('That address line is too long.');
  const postalCode = args.postalCode?.trim();
  if (postalCode && !isValidPinCode(postalCode))
    return fail('The PIN code must be exactly 6 digits.');

  const address = {
    ...resolved.targetUser.address,
    line1,
    line2: args.line2?.trim() || undefined,
    city,
    state: args.state?.trim() || resolved.targetUser.address?.state,
    postalCode: postalCode || resolved.targetUser.address?.postalCode,
  };
  const cleaned = Object.fromEntries(
    Object.entries(address).filter(([, v]) => v !== undefined && v !== ''),
  );

  await getUsersCollection().updateOne(
    { _id: resolved.targetUser._id },
    { $set: { address: cleaned, updatedAt: new Date() } },
  );

  return {
    success: true,
    address: formatAddress(cleaned),
    addressMissing: deliveryAddressGaps(cleaned),
  };
}
