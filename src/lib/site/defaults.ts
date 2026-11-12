/**
 * Valores por defecto mientras no haya datos en site_settings (Fase 3).
 * Horario tomado del escaparate. Dirección/teléfono/URL de Maps: vacíos a propósito,
 * no se inventan; se rellenan desde /admin/configuracion.
 */
import type { Locale } from "@/lib/i18n/config";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n/config";

export type DayHours = { open: string; close: string } | null; // null = fermé

export const DEFAULT_SETTINGS = {
  name: "Relax Sélection",
  city: "Genève",
  country: "CH",
  address: "",
  postalCode: "",
  phone: "",
  email: "",
  mapsUrl: "",
  timezone: "Europe/Zurich",
  // Lunes → domingo
  hours: [
    { open: "10:00", close: "19:00" },
    { open: "10:00", close: "19:00" },
    { open: "10:00", close: "19:00" },
    { open: "10:00", close: "19:00" },
    { open: "10:00", close: "19:00" },
    { open: "10:00", close: "19:00" },
    null,
  ] as DayHours[],
};

/** Idiomas activos. Provisional (env) hasta leer site_settings.enabled_locales en la Fase 3. */
export function getEnabledLocales(): Locale[] {
  const raw = process.env.NEXT_PUBLIC_ENABLED_LOCALES ?? DEFAULT_LOCALE;
  const list = raw.split(",").map((s) => s.trim()).filter(isLocale);
  return list.includes(DEFAULT_LOCALE) ? list : [DEFAULT_LOCALE, ...list];
}
