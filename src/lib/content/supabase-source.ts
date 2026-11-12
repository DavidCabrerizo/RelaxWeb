import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient, mediaUrl } from "@/lib/supabase/public";
import { CATEGORY_ICONS, type CategoryIconName } from "@/components/brand/CategoryIcon";
import type { Localized, OpeningSlot, RawBrand, RawCategory, RawProduct, SiteSettings } from "./types";

/**
 * Lectura del contenido público desde Supabase, convertido a las mismas formas "Raw*"
 * que usaban los datos DEMO. El catálogo es pequeño (decenas de productos), así que se
 * lee completo en UNA consulta por tabla y se filtra en memoria: menos peticiones y
 * una sola entrada de caché.
 *
 * Caché: etiqueta CONTENT_TAG. El panel (Fase 4) la invalida con updateTag() tras cada
 * cambio; cacheLife("hours") es solo una red de seguridad.
 */
export const CONTENT_TAG = "content";

export type Catalog = {
  categories: RawCategory[];
  brands: RawBrand[];
  products: RawProduct[];
  redirects: { entity_type: "product" | "brand" | "category"; from_slug: string; to_slug: string }[];
};

type Tr = { locale: string } & Record<string, unknown>;

/** Filas de traducción → { fr: …, en: … } para un campo. */
function localized<T = string>(rows: Tr[] | null | undefined, field: string): Localized<T> | undefined {
  const out: Record<string, T> = {};
  for (const r of rows ?? []) {
    const v = r[field];
    if (v !== null && v !== undefined && v !== "") out[r.locale] = v as T;
  }
  return "fr" in out ? (out as Localized<T>) : undefined;
}

const asIcon = (v: unknown): CategoryIconName =>
  (CATEGORY_ICONS as readonly string[]).includes(String(v)) ? (v as CategoryIconName) : "vape";

export async function loadCatalog(): Promise<Catalog> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");

  const db = createPublicClient();
  const [cats, brands, products, redirects] = await Promise.all([
    db
      .from("categories")
      .select("id, slug, icon, sort_order, category_translations(locale, name, description)")
      .order("sort_order"),
    db
      .from("brands")
      .select("id, slug, logo_path, is_featured, sort_order, brand_translations(locale, name, description)")
      .order("sort_order"),
    db
      .from("products")
      .select(
        "slug, is_featured, sort_order, brand_id, category_id," +
          " product_translations(locale, name, short_description, description, features)," +
          " product_images(storage_path, alt, is_primary, sort_order)",
      )
      .order("sort_order"),
    db.from("slug_redirects").select("entity_type, from_slug, to_slug"),
  ]);

  for (const r of [cats, brands, products, redirects]) {
    if (r.error) throw new Error(`Supabase: ${r.error.message}`);
  }

  const catById = new Map<string, RawCategory>();
  const categories: RawCategory[] = [];
  for (const c of cats.data ?? []) {
    const name = localized(c.category_translations as Tr[], "name");
    if (!name) continue; // sin nombre en francés no se muestra
    const raw: RawCategory = {
      slug: c.slug,
      icon: asIcon(c.icon),
      sortOrder: c.sort_order,
      name,
      description: localized(c.category_translations as Tr[], "description"),
    };
    catById.set(c.id, raw);
    categories.push(raw);
  }

  const brandById = new Map<string, RawBrand>();
  const brandList: RawBrand[] = [];
  for (const b of brands.data ?? []) {
    const name = localized(b.brand_translations as Tr[], "name");
    if (!name) continue;
    const raw: RawBrand = {
      slug: b.slug,
      isFeatured: b.is_featured,
      sortOrder: b.sort_order,
      name,
      description: localized(b.brand_translations as Tr[], "description"),
      logoUrl: mediaUrl(b.logo_path),
    };
    brandById.set(b.id, raw);
    brandList.push(raw);
  }

  type ProductRow = {
    slug: string;
    is_featured: boolean;
    sort_order: number;
    brand_id: string | null;
    category_id: string | null;
    product_translations: Tr[];
    product_images: { storage_path: string; alt: Record<string, string>; is_primary: boolean; sort_order: number }[];
  };

  const productList: RawProduct[] = [];
  for (const p of (products.data ?? []) as unknown as ProductRow[]) {
    const brand = p.brand_id ? brandById.get(p.brand_id) : undefined;
    const category = p.category_id ? catById.get(p.category_id) : undefined;
    const name = localized(p.product_translations, "name");
    // Un producto publicado cuya marca/categoría no es visible no se muestra (evita enlaces rotos)
    if (!brand || !category || !name) continue;
    const images = [...(p.product_images ?? [])]
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
      .map((i) => ({ url: mediaUrl(i.storage_path)!, alt: { fr: i.alt?.fr ?? "", ...i.alt } as Localized }));
    productList.push({
      slug: p.slug,
      brandSlug: brand.slug,
      categorySlug: category.slug,
      isFeatured: p.is_featured,
      sortOrder: p.sort_order,
      isDemo: p.slug.endsWith("-demo"),
      name,
      shortDescription: localized(p.product_translations, "short_description") ?? { fr: "" },
      description: localized(p.product_translations, "description") ?? { fr: "" },
      features: localized<string[]>(p.product_translations, "features") ?? { fr: [] },
      images,
    });
  }

  return {
    categories,
    brands: brandList,
    products: productList,
    redirects: (redirects.data ?? []) as Catalog["redirects"],
  };
}

export async function loadSettings(): Promise<SiteSettings & { enabledLocales: string[] }> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  const s = data ?? {};
  const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));

  return {
    businessName: s.business_name ?? "Relax Sélection",
    street: s.address_street ?? null,
    postalCode: s.address_postal_code ?? null,
    city: s.address_city ?? "Genève",
    country: s.address_country ?? "CH",
    latitude: num(s.latitude),
    longitude: num(s.longitude),
    phone: s.phone ?? null,
    whatsapp: s.whatsapp ?? null,
    email: s.email ?? null,
    googleMapsUrl: s.google_maps_url ?? null,
    googleBusinessUrl: s.google_business_url ?? null,
    openingHours: (Array.isArray(s.opening_hours) ? s.opening_hours : []) as OpeningSlot[],
    social: s.social_links ?? {},
    timezone: "Europe/Zurich",
    enabledLocales: Array.isArray(s.enabled_locales) ? s.enabled_locales : ["fr"],
  };
}
