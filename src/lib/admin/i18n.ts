import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { ADMIN_LOCALES } from "./form";

/**
 * Reglas de las traducciones en el panel:
 *  - Francés: el nombre es obligatorio.
 *  - Otros idiomas: opcionales. Si se rellena cualquier campo, el nombre pasa a ser obligatorio.
 *    Si se dejan todos vacíos, se borra esa traducción y la web muestra el francés.
 */
export function validateTranslations<F extends string>(
  tr: Record<Locale, Record<F, string | null>>,
  nameField: F,
  errors: Record<string, string>,
) {
  if (!tr.fr[nameField]) errors[`${nameField}_fr`] = "El nombre en francés es obligatorio.";
  for (const l of ADMIN_LOCALES) {
    if (l === "fr") continue;
    const anyFilled = Object.values(tr[l]).some(Boolean);
    if (anyFilled && !tr[l][nameField]) errors[`${nameField}_${l}`] = "Si traduces este elemento, el nombre es obligatorio.";
  }
}

/** Idiomas con contenido (para upsert) y vacíos (para borrar su fila). */
export function splitLocales<F extends string>(tr: Record<Locale, Record<F, string | null>>, nameField: F) {
  const filled = ADMIN_LOCALES.filter((l) => tr[l][nameField]);
  const empty = ADMIN_LOCALES.filter((l) => !tr[l][nameField]);
  return { filled, empty };
}

/** Busca la traducción de un idioma en las filas embebidas. */
export function trOf<T extends { locale: string }>(rows: T[] | null | undefined, locale: string): T | undefined {
  return rows?.find((r) => r.locale === locale);
}

export const LOCALE_LABEL: Record<string, string> = { fr: "Français", en: "English" };
