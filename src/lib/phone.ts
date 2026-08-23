/** Normalizes a phone number to digits only, for deduping customer records. */
export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}
