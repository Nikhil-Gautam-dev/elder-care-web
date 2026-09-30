import type { IAddress } from "../types/user.js";

/** Indian PIN codes are exactly 6 digits. */
export const PIN_DIGITS = 6;

export const isValidPinCode = (value: string): boolean =>
  /^\d{6}$/.test(value.trim());

/** What is still needed before something can be delivered (empty when the address is complete). */
export function deliveryAddressGaps(
  address: IAddress | undefined | null,
): string[] {
  const gaps: string[] = [];
  if (!address?.line1?.trim())
    gaps.push("house number and street (address line 1)");
  if (!address?.city?.trim()) gaps.push("city");
  return gaps;
}

/** "14 Green Valley Road, Chandigarh, Punjab 160001" */
export function formatAddress(address: IAddress | undefined | null): string {
  if (!address) return "";
  const place = [address.city, address.state].filter(Boolean).join(", ");
  const withPin = [place, address.postalCode].filter(Boolean).join(" ");
  return [address.line1, address.line2, withPin]
    .filter((part) => part && part.trim())
    .join(", ");
}
