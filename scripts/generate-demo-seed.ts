/**
 * Genera supabase/seed/demo.sql a partir de src/lib/content/demo-data.ts
 * (única fuente de los datos DEMO). Uso: npx tsx scripts/generate-demo-seed.ts
 */
import { writeFileSync } from "node:fs";
import { DEMO_BRANDS, DEMO_CATEGORIES, DEMO_PRODUCTS } from "../src/lib/content/demo-data";

const q = (v: unknown) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const j = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;
const out: string[] = [
  "-- DATOS DEMO (generado por scripts/generate-demo-seed.ts). Borrar con supabase/seed/remove-demo.sql",
  "begin;",
];

// Traducciones de categorías (las categorías ya existen por la migración seed_base)
for (const c of DEMO_CATEGORIES) {
  for (const [locale, name] of Object.entries(c.name)) {
    const desc = (c.description as Record<string, string> | undefined)?.[locale];
    out.push(
      `insert into public.category_translations (category_id, locale, name, description)
select id, ${q(locale)}, ${q(name)}, ${q(desc)} from public.categories where slug = ${q(c.slug)}
on conflict (category_id, locale) do update set name = excluded.name, description = excluded.description;`,
    );
  }
}

for (const b of DEMO_BRANDS) {
  out.push(
    `insert into public.brands (slug, is_featured, is_published, sort_order) values (${q(b.slug)}, ${b.isFeatured}, true, ${b.sortOrder}) on conflict (slug) do nothing;`,
  );
  for (const [locale, name] of Object.entries(b.name)) {
    const desc = (b.description as Record<string, string> | undefined)?.[locale];
    out.push(
      `insert into public.brand_translations (brand_id, locale, name, description)
select id, ${q(locale)}, ${q(name)}, ${q(desc)} from public.brands where slug = ${q(b.slug)}
on conflict (brand_id, locale) do update set name = excluded.name, description = excluded.description;`,
    );
  }
}

for (const p of DEMO_PRODUCTS) {
  out.push(
    `insert into public.products (slug, brand_id, category_id, status, is_featured, sort_order)
select ${q(p.slug)}, b.id, c.id, 'published', ${p.isFeatured}, ${p.sortOrder}
from public.brands b, public.categories c where b.slug = ${q(p.brandSlug)} and c.slug = ${q(p.categorySlug)}
on conflict (slug) do nothing;`,
  );
  for (const locale of Object.keys(p.name) as (keyof typeof p.name)[]) {
    out.push(
      `insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, ${q(locale)}, ${q(p.name[locale])}, ${q(p.shortDescription[locale])}, ${q(p.description[locale])}, ${j(p.features[locale] ?? [])}
from public.products where slug = ${q(p.slug)}
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;`,
    );
  }
}
out.push("commit;");
writeFileSync("supabase/seed/demo.sql", out.join("\n\n") + "\n");
console.log(`demo.sql: ${DEMO_BRANDS.length} marcas, ${DEMO_PRODUCTS.length} productos`);
