import type { Metadata } from "next";
import { DEFAULT_LOCALE, HTML_LANG, localizedPath, type Locale } from "@/lib/i18n/config";
import { getEnabledLocales } from "@/lib/site/defaults";
import { getSeoOverride } from "@/lib/content/repository";

/** Páginas fijas cuyo SEO se edita en /admin/seo. */
export const STATIC_PAGES = [
  { key: "home", path: "/", label: "Inicio" },
  { key: "products", path: "/produits", label: "Productos" },
  { key: "brands", path: "/marques", label: "Marcas" },
  { key: "about", path: "/a-propos", label: "À propos" },
  { key: "contact", path: "/contact", label: "Contacto" },
  { key: "legal", path: "/mentions-legales", label: "Mentions légales" },
  { key: "privacy", path: "/confidentialite", label: "Confidentialité" },
] as const;
export type StaticPageKey = (typeof STATIC_PAGES)[number]["key"];

export { siteUrl } from "./site";

/**
 * Metadatos de una página pública: canonical propia, hreflang de cada idioma activo
 * (+ x-default al francés), Open Graph y Twitter.
 * - `pageKey`: aplica el título/descripción/noindex editados en /admin/seo (páginas fijas).
 * - Productos, marcas y categorías pasan ya su título/descripción SEO (o los generados).
 */
export async function pageMetadata(opts: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  absoluteTitle?: boolean;
  pageKey?: StaticPageKey;
  image?: string;
  noindex?: boolean;
}): Promise<Metadata> {
  const { locale, path, absoluteTitle } = opts;
  // Imagen propia (foto de producto/portada de marca) o la imagen por defecto de la web
  const image = opts.image ?? "/og.png";
  const override = opts.pageKey ? await getSeoOverride(opts.pageKey, locale) : undefined;
  const title = override?.title || opts.title;
  const description = (override?.description || opts.description).slice(0, 170);
  const noindex = opts.noindex || override?.noindex;

  const languages: Record<string, string> = {};
  for (const l of await getEnabledLocales()) languages[HTML_LANG[l]] = localizedPath(l, path);
  languages["x-default"] = localizedPath(DEFAULT_LOCALE, path);

  return {
    // Un título editado a mano se usa tal cual (sin añadir « | Relax Sélection Genève »)
    title: absoluteTitle || override?.title ? { absolute: title } : title,
    description,
    alternates: { canonical: localizedPath(locale, path), languages },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: localizedPath(locale, path),
      siteName: "Relax Sélection",
      locale: locale === "fr" ? "fr_CH" : "en_GB",
      type: "website",
      images: [{ url: image, ...(opts.image ? {} : { width: 1200, height: 630, alt: "Relax Sélection" }) }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
