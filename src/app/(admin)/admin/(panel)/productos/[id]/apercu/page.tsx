import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryIcon, type CategoryIconName } from "@/components/brand/CategoryIcon";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/supabase/public";
import { trOf } from "@/lib/admin/i18n";
import { uuid } from "@/lib/admin/form";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Vista previa de una ficha (también de borradores, que no son públicos).
 * Lee con la sesión del editor: RLS deja ver borradores solo al staff.
 */
export default function PreviewPage({ params, searchParams }: PageProps<"/admin/productos/[id]/apercu">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-ink-3" />}>
      <Preview params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ params, searchParams }: PageProps<"/admin/productos/[id]/apercu">) {
  await requireStaff();
  const id = uuid((await params).id);
  if (!id) notFound();
  const lang = (await searchParams).lang === "en" ? "en" : "fr";
  const t = await getDictionary(lang);

  const db = await createClient();
  const { data: p } = await db
    .from("products")
    .select(
      "slug, status, product_translations(*), product_images(storage_path, alt, is_primary, sort_order)," +
        " brands(slug, brand_translations(locale, name)), categories(slug, icon, category_translations(locale, name))",
    )
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  type Row = {
    slug: string;
    status: "draft" | "published";
    product_translations: { locale: string; name: string; short_description: string | null; description: string | null; features: unknown }[];
    product_images: { storage_path: string; is_primary: boolean; sort_order: number }[];
    brands: { slug: string; brand_translations: { locale: string; name: string }[] } | null;
    categories: { slug: string; icon: string; category_translations: { locale: string; name: string }[] } | null;
  };
  const row = p as unknown as Row;
  const tr = trOf(row.product_translations, lang) ?? trOf(row.product_translations, "fr");
  const brand = row.brands ? (trOf(row.brands.brand_translations, lang) ?? trOf(row.brands.brand_translations, "fr"))?.name : null;
  const category = row.categories ? (trOf(row.categories.category_translations, lang) ?? trOf(row.categories.category_translations, "fr"))?.name : null;
  const image = [...row.product_images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)[0];
  const features = Array.isArray(tr?.features) ? (tr.features as string[]) : [];
  const fallback = lang === "en" && !trOf(row.product_translations, "en");

  return (
    <main>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm text-amber-200">
        <span>
          Vista previa {row.status === "draft" ? "· BORRADOR (no visible en la web)" : "· publicado"}
          {fallback && " · sin traducción EN: se muestra el francés"}
        </span>
        <span className="flex gap-2">
          <Link href={`/admin/productos/${id}/apercu?lang=fr`} className={lang === "fr" ? "font-bold underline" : ""}>FR</Link>
          <Link href={`/admin/productos/${id}/apercu?lang=en`} className={lang === "en" ? "font-bold underline" : ""}>EN</Link>
          <Link href={`/admin/productos/${id}`} className="ml-3 font-bold">← Editar</Link>
        </span>
      </div>

      <article className="grid gap-10 lg:grid-cols-2">
        <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[var(--radius-card)] border border-line-dark bg-ink-3">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(image.storage_path)} alt="" className="h-full w-full object-cover" />
          ) : (
            <CategoryIcon icon={(row.categories?.icon ?? "vape") as CategoryIconName} className="h-20 w-20" />
          )}
        </div>
        <div>
          <p className="eyebrow text-lime">{brand ?? "—"}</p>
          <h1 className="display mt-3 text-3xl sm:text-4xl">{tr?.name}</h1>
          <p className="mt-4 text-lg text-paper/85">{tr?.short_description}</p>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-dark">{tr?.description}</p>
          {features.length > 0 && (
            <>
              <h2 className="eyebrow mt-8 text-lime">{t.catalog.features}</h2>
              <ul className="mt-3 space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                    {f}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-8 text-sm text-muted-dark">
            {t.catalog.category}: {category ?? "—"}
          </p>
        </div>
      </article>
    </main>
  );
}
