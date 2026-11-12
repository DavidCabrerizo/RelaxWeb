import "server-only";
import { createClient } from "@/lib/supabase/server";
import { trOf } from "./i18n";

/** Marcas y categorías para los desplegables del panel (incluye las ocultas, marcadas). */
export async function brandAndCategoryOptions() {
  const db = await createClient();
  const [brands, categories] = await Promise.all([
    db.from("brands").select("id, slug, is_published, brand_translations(locale, name)").order("sort_order"),
    db.from("categories").select("id, slug, is_published, category_translations(locale, name)").order("sort_order"),
  ]);
  return {
    brands: (brands.data ?? []).map((b) => ({
      value: b.id,
      label: (trOf(b.brand_translations, "fr")?.name ?? b.slug) + (b.is_published ? "" : " (oculta)"),
    })),
    categories: (categories.data ?? []).map((c) => ({
      value: c.id,
      label: (trOf(c.category_translations, "fr")?.name ?? c.slug) + (c.is_published ? "" : " (oculta)"),
    })),
  };
}
