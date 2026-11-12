import Link from "next/link";
import { Suspense } from "react";
import { AdminHeader, Badge, OkNotice } from "@/components/admin/AdminHeader";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { trOf } from "@/lib/admin/i18n";
import { brandAndCategoryOptions } from "@/lib/admin/options";
import { toggleProduct } from "./actions";

export default function ProductsAdminPage({ searchParams }: PageProps<"/admin/productos">) {
  return (
    <main>
      <AdminHeader title="Productos" action={{ href: "/admin/productos/nuevo", label: "+ Nuevo producto" }} />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-ink-3" />}>
        <ProductList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

async function ProductList({ searchParams }: Pick<PageProps<"/admin/productos">, "searchParams">) {
  await requireStaff();
  const sp = await searchParams;
  const q = one(sp.q).slice(0, 80);
  const category = one(sp.categoria);
  const brand = one(sp.marca);
  const status = one(sp.estado);

  const db = await createClient();
  const [{ data }, options] = await Promise.all([
    db
      .from("products")
      .select("id, slug, status, is_featured, sort_order, brand_id, category_id, updated_at, product_translations(locale, name)")
      .order("sort_order"),
    brandAndCategoryOptions(),
  ]);

  const brandName = new Map(options.brands.map((b) => [b.value, b.label]));
  const categoryName = new Map(options.categories.map((c) => [c.value, c.label]));

  // Catálogo pequeño: se filtra en memoria (búsqueda sobre los nombres FR/EN y el slug)
  const list = (data ?? []).filter((p) => {
    if (category && p.category_id !== category) return false;
    if (brand && p.brand_id !== brand) return false;
    if ((status === "draft" || status === "published") && p.status !== status) return false;
    if (q) {
      const hay = norm([p.slug, ...p.product_translations.map((t) => t.name)].join(" "));
      if (!hay.includes(norm(q))) return false;
    }
    return true;
  });

  const select = "rounded-xl border border-line-dark bg-ink px-3 py-2.5 text-sm";

  return (
    <>
      <OkNotice code={sp.ok} />
      <form className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]" role="search">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o slug…"
          aria-label="Buscar productos"
          className={`${select} placeholder:text-paper/30`}
        />
        <select name="categoria" defaultValue={category} aria-label="Categoría" className={select}>
          <option value="">Todas las categorías</option>
          {options.categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select name="marca" defaultValue={brand} aria-label="Marca" className={select}>
          <option value="">Todas las marcas</option>
          {options.brands.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
        <select name="estado" defaultValue={status} aria-label="Estado" className={select}>
          <option value="">Todos los estados</option>
          <option value="published">Publicados</option>
          <option value="draft">Borradores</option>
        </select>
        <button className="rounded-full border border-lime px-5 py-2.5 text-sm font-bold uppercase text-lime hover:bg-lime hover:text-ink">
          Filtrar
        </button>
      </form>

      <p className="mb-3 text-sm text-muted-dark" role="status">
        {list.length} de {data?.length ?? 0} productos
      </p>

      {list.length ? (
        <ul className="divide-y divide-line-dark overflow-hidden rounded-2xl border border-line-dark bg-ink">
          {list.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Link href={`/admin/productos/${p.id}`} className="min-w-0 flex-1 hover:text-lime">
                <span className="block truncate font-semibold">{trOf(p.product_translations, "fr")?.name ?? p.slug}</span>
                <span className="block truncate text-xs text-muted-dark">
                  {categoryName.get(p.category_id ?? "") ?? "Sin categoría"} · {brandName.get(p.brand_id ?? "") ?? "Sin marca"} · orden {p.sort_order}
                  {!trOf(p.product_translations, "en") && " · sin traducción EN"}
                </span>
              </Link>
              <form action={toggleProduct.bind(null, p.id, "featured")}>
                <button
                  aria-pressed={p.is_featured}
                  title={p.is_featured ? "Quitar de destacados" : "Destacar"}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${
                    p.is_featured ? "bg-lime/15 text-lime" : "border border-line-dark text-muted-dark hover:text-lime"
                  }`}
                >
                  ★ {p.is_featured ? "Destacado" : "Destacar"}
                </button>
              </form>
              <form action={toggleProduct.bind(null, p.id, "status")}>
                <button title={p.status === "published" ? "Pasar a borrador" : "Publicar"} className="rounded-full">
                  <Badge on={p.status === "published"} onLabel="Publicado" offLabel="Borrador" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-line-dark p-8 text-center text-muted-dark">Ningún producto coincide con la búsqueda.</p>
      )}
    </>
  );
}
