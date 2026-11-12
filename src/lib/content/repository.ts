import "server-only";
/**
 * Capa de acceso al contenido. Las páginas solo llaman a estas funciones.
 * Fase 2: lee los datos DEMO. Fase 3: misma firma, implementación con Supabase
 * (tablas base + *_translations), sin tocar las páginas.
 */
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { DEMO_BRANDS, DEMO_CATEGORIES, DEMO_PRODUCTS, DEMO_SETTINGS } from "./demo-data";
import type { Brand, Category, Localized, Product, RawBrand, RawCategory, RawProduct, SiteSettings } from "./types";

/** Texto en el idioma pedido, con el francés como respaldo. */
export function pick<T>(value: Localized<T>, locale: Locale): T;
export function pick<T>(value: Localized<T> | undefined, locale: Locale): T | undefined;
export function pick<T>(value: Localized<T> | undefined, locale: Locale): T | undefined {
  if (!value) return undefined;
  return (value as Partial<Record<Locale, T>>)[locale] ?? value[DEFAULT_LOCALE];
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
});

function toProduct(p: RawProduct, l: Locale): Product {
  const brand = DEMO_BRANDS.find((b) => b.slug === p.brandSlug)!;
  const category = DEMO_CATEGORIES.find((c) => c.slug === p.categorySlug)!;
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
  return [...DEMO_CATEGORIES].sort(bySort).map((c) => toCategory(c, locale));
}

export async function getCategory(slug: string, locale: Locale): Promise<Category | null> {
  const c = DEMO_CATEGORIES.find((x) => x.slug === slug);
  return c ? toCategory(c, locale) : null;
}

export async function getBrands(locale: Locale, opts: { featuredOnly?: boolean } = {}): Promise<Brand[]> {
  return [...DEMO_BRANDS]
    .filter((b) => !opts.featuredOnly || b.isFeatured)
    .sort(bySort)
    .map((b) => toBrand(b, locale));
}

export async function getBrand(slug: string, locale: Locale): Promise<Brand | null> {
  const b = DEMO_BRANDS.find((x) => x.slug === slug);
  return b ? toBrand(b, locale) : null;
}

export async function getProducts(
  locale: Locale,
  filters: { category?: string; brand?: string; featuredOnly?: boolean; limit?: number } = {},
): Promise<Product[]> {
  const catOrder = new Map(DEMO_CATEGORIES.map((c) => [c.slug, c.sortOrder]));
  const list = DEMO_PRODUCTS.filter(
    (p) =>
      (!filters.category || p.categorySlug === filters.category) &&
      (!filters.brand || p.brandSlug === filters.brand) &&
      (!filters.featuredOnly || p.isFeatured),
  ).sort((a, b) => (catOrder.get(a.categorySlug)! - catOrder.get(b.categorySlug)!) || a.sortOrder - b.sortOrder);
  return list.slice(0, filters.limit ?? list.length).map((p) => toProduct(p, locale));
}

export async function getProduct(slug: string, locale: Locale): Promise<Product | null> {
  const p = DEMO_PRODUCTS.find((x) => x.slug === slug);
  return p ? toProduct(p, locale) : null;
}

export async function getSettings(): Promise<SiteSettings> {
  return DEMO_SETTINGS;
}

/** Slugs para generateStaticParams y, en la Fase 7, para el sitemap. */
export async function getAllSlugs() {
  return {
    products: DEMO_PRODUCTS.map((p) => p.slug),
    brands: DEMO_BRANDS.map((b) => b.slug),
    categories: DEMO_CATEGORIES.map((c) => c.slug),
  };
}
