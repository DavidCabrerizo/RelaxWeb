/**
 * Estrategia multidioma
 * - fr (fr-CH) es el idioma por defecto y se sirve SIN prefijo: /, /produits…
 *   Internamente proxy.ts reescribe a /fr/... para que todo viva bajo app/[lang].
 * - Los idiomas secundarios llevan prefijo: /en/produits…
 * - SUPPORTED_LOCALES lista los idiomas que el código sabe servir (tienen diccionario).
 *   Cuáles están ACTIVOS lo decide site_settings.enabled_locales (admin).
 *   Un idioma soportado pero no activo devuelve 404 y no aparece en sitemap/hreflang.
 */
export const DEFAULT_LOCALE = "fr" as const;
export const SUPPORTED_LOCALES = ["fr", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const HTML_LANG: Record<Locale, string> = {
  fr: "fr-CH",
  en: "en",
};

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Construye la URL pública de una ruta para un idioma (fr sin prefijo). */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}
