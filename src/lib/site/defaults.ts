import type { Locale } from "@/lib/i18n/config";
import { getActiveLocales } from "@/lib/content/repository";

/** Idiomas activos: se leen de site_settings.enabled_locales (configurable desde el admin). */
export async function getEnabledLocales(): Promise<Locale[]> {
  return getActiveLocales();
}
