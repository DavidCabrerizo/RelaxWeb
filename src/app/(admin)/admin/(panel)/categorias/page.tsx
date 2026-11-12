import Link from "next/link";
import { Suspense } from "react";
import { AdminHeader, Badge, OkNotice } from "@/components/admin/AdminHeader";
import { CategoryIcon, type CategoryIconName } from "@/components/brand/CategoryIcon";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { trOf } from "@/lib/admin/i18n";

export default function CategoriesPage({ searchParams }: PageProps<"/admin/categorias">) {
  return (
    <main>
      <AdminHeader title="Categorías" action={{ href: "/admin/categorias/nueva", label: "+ Nueva categoría" }} />
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-ink-3" />}>
        <CategoryList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function CategoryList({ searchParams }: Pick<PageProps<"/admin/categorias">, "searchParams">) {
  await requireStaff();
  const { ok } = await searchParams;
  const db = await createClient();
  const { data } = await db
    .from("categories")
    .select("id, slug, icon, sort_order, is_published, category_translations(locale, name), products(count)")
    .order("sort_order");

  return (
    <>
      <OkNotice code={ok} />
      <ul className="divide-y divide-line-dark overflow-hidden rounded-2xl border border-line-dark bg-ink">
        {(data ?? []).map((c) => {
          const products = (c.products as unknown as { count: number }[])[0]?.count ?? 0;
          return (
            <li key={c.id}>
              <Link href={`/admin/categorias/${c.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-ink-3">
                <CategoryIcon icon={c.icon as CategoryIconName} className="h-10 w-10 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{trOf(c.category_translations, "fr")?.name ?? c.slug}</span>
                  <span className="block truncate font-mono text-xs text-muted-dark">/{c.slug}</span>
                </span>
                <span className="hidden text-xs text-muted-dark sm:block">{products} productos</span>
                <span className="hidden text-xs text-muted-dark sm:block">orden {c.sort_order}</span>
                <Badge on={c.is_published} onLabel="Visible" offLabel="Oculta" />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
