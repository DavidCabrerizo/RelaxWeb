import Link from "next/link";
import { Suspense } from "react";
import { AdminHeader, Badge, OkNotice } from "@/components/admin/AdminHeader";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { trOf } from "@/lib/admin/i18n";

export default function BrandsPage({ searchParams }: PageProps<"/admin/marcas">) {
  return (
    <main>
      <AdminHeader title="Marcas" action={{ href: "/admin/marcas/nueva", label: "+ Nueva marca" }} />
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-ink-3" />}>
        <BrandList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function BrandList({ searchParams }: Pick<PageProps<"/admin/marcas">, "searchParams">) {
  await requireStaff();
  const { ok } = await searchParams;
  const db = await createClient();
  const { data } = await db
    .from("brands")
    .select("id, slug, sort_order, is_featured, is_published, brand_translations(locale, name), products(count)")
    .order("sort_order");

  if (!data?.length) return <p className="text-muted-dark">Todavía no hay marcas.</p>;

  return (
    <>
      <OkNotice code={ok} />
      <ul className="divide-y divide-line-dark overflow-hidden rounded-2xl border border-line-dark bg-ink">
        {data.map((b) => {
          const products = (b.products as unknown as { count: number }[])[0]?.count ?? 0;
          return (
            <li key={b.id}>
              <Link href={`/admin/marcas/${b.id}`} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-ink-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{trOf(b.brand_translations, "fr")?.name ?? b.slug}</span>
                  <span className="block truncate font-mono text-xs text-muted-dark">/{b.slug}</span>
                </span>
                <span className="text-xs text-muted-dark">{products} productos · orden {b.sort_order}</span>
                {b.is_featured && <Badge on onLabel="Destacada" offLabel="" />}
                <Badge on={b.is_published} onLabel="Visible" offLabel="Oculta" />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
