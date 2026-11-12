import "server-only";
/**
 * Capa de acceso al contenido. Las páginas solo llaman a estas funciones.
 * Origen de los datos:
 *  - Supabase, si NEXT_PUBLIC_SUPABASE_URL y la clave pública están configuradas (producción).
 *  - Datos DEMO locales en caso contrario (desarrollo sin conexión).
 */
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { supabaseConfigured } from "@/lib/supabase/public";
import { DEMO_BRANDS, DEMO_CATEGORIES, DEMO_PRODUCTS, DEMO_SETTINGS } from "./demo-data";
import { loadCatalog, loadSettings, type Catalog } from "./supabase-source";
import type { Brand, Category, Localized, Product, RawBrand, RawCategory, RawProduct, SiteSettings } from "./types";

/** Texto en el idioma pedido, con el francés como respaldo. */
export function pick<T>(value: Localized<T>, locale: Locale): T;
export function pick<T>(value: Localized<T> | undefined, locale: Locale): T | undefined;
export function pick<T>(value: Localized<T> | undefined, locale: Locale): T | undefined {
  if (!value) return undefined;
  return (value as Partial<Record<Locale, T>>)[locale] ?? value[DEFAULT_LOCALE];
}

async function catalog(): Promise<Catalog> {
  if (supabaseConfigured()) return loadCatalog();
  return { categories: DEMO_CATEGORIES, brands: DEMO_BRANDS, products: DEMO_PRODUCTS, redirects: [] };
}

const bySort = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

const toCategory = (c: RawCategory, l: Locale): Category => ({
  slug: c.slug,
  icon: c.icon,
  name: pick(c.name, l),
  description: pick(c.description, l),
});

const toBrand = (b: RawBrand, l: Locale): Brand => ({
  slug: b.slug,
  isFeatured: b.isFeatured,
  name: pick(b.name, l),
  description: pick(b.description, l),
  logoUrl: b.logoUrl,
  coverUrl: b.coverUrl,
});

function toProduct(p: RawProduct, cat: Catalog, l: Locale): Product {
  const brand = cat.brands.find((b) => b.slug === p.brandSlug)!;
  const category = cat.categories.find((c) => c.slug === p.categorySlug)!;
  return {
    slug: p.slug,
    isFeatured: p.isFeatured,
    isDemo: p.isDemo,
    name: pick(p.name, l),
    shortDescription: pick(p.shortDescription, l),
    description: pick(p.description, l),
    features: pick(p.features, l),
    images: p.images.map((i) => ({ url: i.url, alt: pick(i.alt, l) })),
    brand: toBrand(brand, l),
    category: toCategory(category, l),
  };
}

export async function getCategories(locale: Locale): Promise<Category[]> {
  const cat = await catalog();
  return [...cat.categories].sort(bySort).map((c) => toCategory(c, locale));
}

export async function getCategory(slug: string, locale: Locale): Promise<Category | null> {
  const c = (await catalog()).categories.find((x) => x.slug === slug);
  return c ? toCategory(c, locale) : null;
}

export async function getBrands(locale: Locale, opts: { featuredOnly?: boolean } = {}): Promise<Brand[]> {
  const cat = await catalog();
  return [...cat.brands]
    .filter((b) => !opts.featuredOnly || b.isFeatured)
    .sort(bySort)
    .map((b) => toBrand(b, locale));
}

export async function getBrand(slug: string, locale: Locale): Promise<Brand | null> {
  const b = (await catalog()).brands.find((x) => x.slug === slug);
  return b ? toBrand(b, locale) : null;
}

export async function getProducts(
  locale: Locale,
  filters: { category?: string; brand?: string; featuredOnly?: boolean; limit?: number } = {},
): Promise<Product[]> {
  const cat = await catalog();
  const catOrder = new Map(cat.categories.map((c) => [c.slug, c.sortOrder]));
  const list = cat.products
    .filter(
      (p) =>
        (!filters.category || p.categorySlug === filters.category) &&
        (!filters.brand || p.brandSlug === filters.brand) &&
        (!filters.featuredOnly || p.isFeatured),
    )
    .sort((a, b) => (catOrder.get(a.categorySlug) ?? 0) - (catOrder.get(b.categorySlug) ?? 0) || a.sortOrder - b.sortOrder);
  return list.slice(0, filters.limit ?? list.length).map((p) => toProduct(p, cat, locale));
}

export async function getProduct(slug: string, locale: Locale): Promise<Product | null> {
  const cat = await catalog();
  const p = cat.products.find((x) => x.slug === slug);
  return p ? toProduct(p, cat, locale) : null;
}

/** Nuevo slug si el antiguo fue renombrado (tabla slug_redirects). */
export async function findRedirect(entity: "product" | "brand" | "category", slug: string): Promise<string | null> {
  const r = (await catalog()).redirects.find((x) => x.entity_type === entity && x.from_slug === slug);
  return r?.to_slug ?? null;
}

export async function getSettings(): Promise<SiteSettings> {
  if (!supabaseConfigured()) return DEMO_SETTINGS;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { enabledLocales, ...settings } = await loadSettings();
  return settings;
}

/** Idiomas activos (site_settings.enabled_locales). Sin Supabase: variable de entorno o fr,en. */
export async function getActiveLocales(): Promise<Locale[]> {
  const raw = supabaseConfigured()
    ? (await loadSettings()).enabledLocales
    : (process.env.NEXT_PUBLIC_ENABLED_LOCALES ?? "fr,en").split(",").map((s) => s.trim());
  const list = raw.filter(isLocale);
  return list.includes(DEFAULT_LOCALE) ? list : [DEFAULT_LOCALE, ...list];
}

/** Slugs para generateStaticParams y, en la Fase 7, para el sitemap. */
export async function getAllSlugs() {
  const cat = await catalog();
  return {
    products: cat.products.map((p) => p.slug),
    brands: cat.brands.map((b) => b.slug),
    categories: cat.categories.map((c) => c.slug),
  };
}
