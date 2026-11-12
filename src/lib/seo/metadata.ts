import type { Metadata } from "next";
import { DEFAULT_LOCALE, HTML_LANG, localizedPath, type Locale } from "@/lib/i18n/config";
import { getEnabledLocales } from "@/lib/site/defaults";

/**
 * Metadatos de una página pública: canonical propia + hreflang de cada idioma activo
 * + x-default apuntando al francés. `path` es la ruta SIN prefijo de idioma.
 */
export async function pageMetadata(opts: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  absoluteTitle?: boolean;
}): Promise<Metadata> {
  const { locale, path, title, description, absoluteTitle } = opts;
  const languages: Record<string, string> = {};
  for (const l of (await getEnabledLocales())) languages[HTML_LANG[l]] = localizedPath(l, path);
  languages["x-default"] = localizedPath(DEFAULT_LOCALE, path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: localizedPath(locale, path), languages },
    openGraph: {
      title,
      description,
      url: localizedPath(locale, path),
      siteName: "Relax Sélection",
      locale: locale === "fr" ? "fr_CH" : "en_GB",
      type: "website",
    },
  };
}
