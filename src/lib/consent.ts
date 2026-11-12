/**
 * Cookies propias (estrictamente necesarias o de consentimiento), sin datos personales.
 *  rs_age=1                    → mayoría de edad confirmada (1 año)
 *  rs_consent=accepted|declined → contenidos de terceros (Google Maps) (6 meses)
 */
export const AGE_COOKIE = "rs_age";
export const CONSENT_COOKIE = "rs_consent";
export const CONSENT_EVENT = "rs:consent";

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function writeCookie(name: string, value: string, maxAgeDays: number) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeDays * 86400}; Path=/; SameSite=Lax${secure}`;
}
