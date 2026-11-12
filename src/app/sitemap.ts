import type { MetadataRoute } from "next";
import { HTML_LANG, localizedPath, type Locale } from "@/lib/i18n/config";
import { getEnabledLocales } from "@/lib/site/defaults";
import { getSeoOverride, getSitemapEntries } from "@/lib/content/repository";
import { siteUrl, STATIC_PAGES } from "@/lib/seo/metadata";

/**
 * Sitemap XML dinámico (/sitemap.xml).
 * Una entrada por URL e idioma activo, cada una con sus alternativas hreflang (fr-CH, en, x-default).
 * Se excluyen las páginas fijas marcadas como noindex en /admin/seo.
 * Productos, marcas y categorías salen de la base de datos (solo lo publicado, por RLS).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const locales = await getEnabledLocales();
  const { products, brands, categories } = await getSitemapEntries();

  const alternates = (path: string) => ({
    languages: {
      ...Object.fromEntries(locales.map((l) => [HTML_LANG[l], base + localizedPath(l, path)])),
      "x-default": base + localizedPath("fr", path),
    },
  });

  const entry = (l: Locale, path: string, priority: number, updatedAt?: string): MetadataRoute.Sitemap[number] => ({
    url: base + localizedPath(l, path),
    ...(updatedAt ? { lastModified: new Date(updatedAt) } : {}),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority,
    alternates: alternates(path),
  });

  const out: MetadataRoute.Sitemap = [];
  for (const l of locales) {
    for (const page of STATIC_PAGES) {
      if ((await getSeoOverride(page.key, l))?.noindex) continue;
      const priority = page.key === "home" ? 1 : page.key === "legal" || page.key === "privacy" ? 0.2 : 0.8;
      out.push(entry(l, page.path, priority));
    }
    for (const c of categories) out.push(entry(l, `/categories/${c.slug}`, 0.8, c.updatedAt));
    for (const b of brands) out.push(entry(l, `/marques/${b.slug}`, 0.6, b.updatedAt));
    for (const p of products) out.push(entry(l, `/produits/${p.slug}`, 0.7, p.updatedAt));
  }
  return out;
}
