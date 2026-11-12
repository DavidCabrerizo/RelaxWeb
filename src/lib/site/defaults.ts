import type { Locale } from "@/lib/i18n/config";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n/config";

/**
 * Idiomas activos. Por defecto francés e inglés.
 * Provisional (variable de entorno) hasta leer site_settings.enabled_locales en la Fase 3.
 */
export function getEnabledLocales(): Locale[] {
  const raw = process.env.NEXT_PUBLIC_ENABLED_LOCALES ?? "fr,en";
  const list = raw.split(",").map((s) => s.trim()).filter(isLocale);
  return list.includes(DEFAULT_LOCALE) ? list : [DEFAULT_LOCALE, ...list];
}
