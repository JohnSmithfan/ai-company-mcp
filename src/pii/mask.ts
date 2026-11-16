const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const INTL_PHONE_RE = /\+\d{1,3}(?:[- ]\d{3,4}){2,3}/g;
const CN_MOBILE_RE = /(?<!\d)1[3-9]\d{9}(?!\d)/g;

/**
 * FR-015: PII-like patterns are masked before they enter any audit record
 * or response. Deterministic by construction (pure regex replacement).
 */
export function maskPii(text: string): string {
  return text
    .replace(EMAIL_RE, "[MASKED_EMAIL]")
    .replace(INTL_PHONE_RE, "[MASKED_PHONE]")
    .replace(CN_MOBILE_RE, "[MASKED_PHONE]");
}
