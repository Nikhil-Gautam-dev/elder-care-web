/** ElderCare is India-only: phone numbers are 10 digits, stored as +91XXXXXXXXXX. */
export const COUNTRY_CODE = "+91";
export const PHONE_DIGITS = 10;

/** Keeps only the 10 national digits from whatever the user typed or pasted (+91, 91, 0 prefixes are dropped). */
export function nationalDigits(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.length > PHONE_DIGITS && digits.startsWith("91"))
    digits = digits.slice(2);
  if (digits.length > PHONE_DIGITS && digits.startsWith("0"))
    digits = digits.slice(1);
  return digits.slice(0, PHONE_DIGITS);
}

/** True when the input is exactly a 10-digit Indian number (optionally with +91 / 91 / 0 in front). */
export function isValidIndianPhone(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  const national =
    digits.length === PHONE_DIGITS
      ? digits
      : digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : digits.length === 11 && digits.startsWith("0")
          ? digits.slice(1)
          : "";
  return national.length === PHONE_DIGITS;
}

/** Canonical form "+91XXXXXXXXXX", or null when the input isn't a valid 10-digit Indian number. */
export function normalizeIndianPhone(input: string): string | null {
  return isValidIndianPhone(input)
    ? `${COUNTRY_CODE}${nationalDigits(input)}`
    : null;
}

/** "+919876543210" → "+91 98765 43210". Anything that isn't in canonical form is returned unchanged. */
export function formatIndianPhone(phone: string | undefined | null): string {
  if (!phone) return "";
  const match = /^\+91(\d{5})(\d{5})$/.exec(phone);
  return match ? `${COUNTRY_CODE} ${match[1]} ${match[2]}` : phone;
}
