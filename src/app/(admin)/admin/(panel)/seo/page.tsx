import Link from "next/link";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminForm, Checkbox, LocaleTabs, SubmitButton, TextArea, TextField } from "@/components/admin/Form";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_LOCALES } from "@/lib/admin/form";
import { LOCALE_LABEL, trOf } from "@/lib/admin/i18n";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { STATIC_PAGES, type StaticPageKey } from "@/lib/seo/metadata";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { saveSeoPage } from "./actions";

export default function SeoPage() {
  return (
    <main className="max-w-3xl">
      <AdminHeader title="SEO">
        <p className="mt-2 text-sm text-muted-dark">
          Revisión del contenido para Google y títulos de las páginas fijas. Los borradores nunca se indexan: no son públicos.
        </p>
      </AdminHeader>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-ink-3" />}>
        <Editor />
      </Suspense>
    </main>
  );
}

type Issue = { href: string; name: string; problems: string[]; level: "error" | "warn" };

/** Textos por defecto de cada página fija (los que se usan si no se edita nada). */
function defaults(key: StaticPageKey, t: Dictionary) {
  const m = t.meta;
  const map: Record<StaticPageKey, { title: string; description: string }> = {
    home: { title: m.siteTitle, description: m.siteDescription },
    products: m.products,
    brands: m.brands,
    about: m.about,
    contact: m.contact,
    legal: m.legal,
    privacy: m.privacy,
  };
  return map[key];
}

async function Editor() {
  await requireStaff();
  const db = await createClient();
  const [seo, products, brands, categories, dicts] = await Promise.all([
    db.from("seo_metadata").select("page_key, locale, title, description, noindex"),
    db
      .from("products")
      .select("id, slug, status, product_translations(locale, name, short_description, seo_title, seo_description), product_images(id)")
      .eq("status", "published"),
    db.from("brands").select("id, slug, is_published, logo_path, brand_translations(locale, name, description)").eq("is_published", true),
    db.from("categories").select("id, slug, is_published, category_translations(locale, name, description)").eq("is_published", true),
    Promise.all(ADMIN_LOCALES.map(async (l) => [l, await getDictionary(l)] as const)).then(Object.fromEntries),
  ]);

  // ---- Revisión de contenido publicado
  const issues: Issue[] = [];
  for (const p of products.data ?? []) {
    const fr = trOf(p.product_translations, "fr");
    const en = trOf(p.product_translations, "en");
    const problems: string[] = [];
    let level: Issue["level"] = "warn";
    if (!p.product_images.length) {
      problems.push("sin fotografías");
      level = "error";
    }
    if (!fr?.short_description) {
      problems.push("sin descripción corta (FR)");
      level = "error";
    }
    if (!en) problems.push("sin traducción inglesa");
    if (!fr?.seo_description) problems.push("metadescripción automática (FR)");
    if (problems.length) issues.push({ href: `/admin/productos/${p.id}`, name: fr?.name ?? p.slug, problems, level });
  }
  for (const b of brands.data ?? []) {
    const problems: string[] = [];
    if (!b.logo_path) problems.push("sin logotipo");
    if (!trOf(b.brand_translations, "fr")?.description) problems.push("sin descripción (FR)");
    if (!trOf(b.brand_translations, "en")) problems.push("sin traducción inglesa");
    if (problems.length) issues.push({ href: `/admin/marcas/${b.id}`, name: `Marca · ${trOf(b.brand_translations, "fr")?.name ?? b.slug}`, problems, level: "warn" });
  }
  for (const c of categories.data ?? []) {
    const problems: string[] = [];
    if (!trOf(c.category_translations, "fr")?.description) problems.push("sin descripción (FR)");
    if (!trOf(c.category_translations, "en")) problems.push("sin traducción inglesa");
    if (problems.length) issues.push({ href: `/admin/categorias/${c.id}`, name: `Categoría · ${trOf(c.category_translations, "fr")?.name ?? c.slug}`, problems, level: "warn" });
  }
  issues.sort((a, b) => (a.level === b.level ? 0 : a.level === "error" ? -1 : 1));

  const stored = new Map((seo.data ?? []).map((r) => [`${r.page_key}|${r.locale}`, r]));

  return (
    <div className="space-y-10">
      <section aria-labelledby="h-review">
        <h2 id="h-review" className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-dark">
          Revisión del contenido publicado
        </h2>
        {issues.length ? (
          <ul className="divide-y divide-line-dark rounded-2xl border border-line-dark bg-ink">
            {issues.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm hover:bg-ink-3">
                  <span aria-hidden="true" className={i.level === "error" ? "text-red-300" : "text-amber-300"}>
                    {i.level === "error" ? "●" : "○"}
                  </span>
                  <span className="font-semibold">{i.name}</span>
                  <span className="text-xs text-muted-dark">{i.problems.join(" · ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-lime/40 bg-lime/10 p-4 text-sm text-lime">Todo el contenido publicado está completo.</p>
        )}
        <p className="mt-2 text-xs text-muted-dark">● importante para Google · ○ recomendable</p>
      </section>

      <section aria-labelledby="h-pages" className="space-y-8">
        <h2 id="h-pages" className="text-sm font-bold uppercase tracking-wider text-muted-dark">Páginas fijas</h2>
        {STATIC_PAGES.map((page) => (
          <div key={page.key}>
            <h3 className="mb-2 font-bold">
              {page.label} <span className="font-mono text-xs font-normal text-muted-dark">{page.path}</span>
            </h3>
            <AdminForm action={saveSeoPage}>
              <input type="hidden" name="page_key" value={page.key} />
              <LocaleTabs
                panels={ADMIN_LOCALES.map((l) => {
                  const row = stored.get(`${page.key}|${l}`);
                  const def = defaults(page.key, dicts[l]);
                  return {
                    locale: l,
                    label: LOCALE_LABEL[l],
                    required: true,
                    content: (
                      <>
                        <TextField name={`title_${l}`} label="Título" defaultValue={row?.title} maxLength={70} recommended={60} hint={`Por defecto: ${def.title}`} />
                        <TextArea name={`description_${l}`} label="Metadescripción" defaultValue={row?.description} maxLength={170} recommended={155} rows={2} hint={`Por defecto: ${def.description}`} />
                        <Checkbox name={`noindex_${l}`} label="No indexar esta página en Google" defaultChecked={row?.noindex} />
                      </>
                    ),
                  };
                })}
              />
              <SubmitButton>Guardar</SubmitButton>
            </AdminForm>
          </div>
        ))}
      </section>
    </div>
  );
}
