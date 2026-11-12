import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminHeader, Badge, OkNotice } from "@/components/admin/AdminHeader";
import { DeleteForm } from "@/components/admin/Form";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { trOf } from "@/lib/admin/i18n";
import { uuid } from "@/lib/admin/form";
import { BrandForm } from "../BrandForm";
import { BrandImages } from "@/components/admin/BrandImages";
import { mediaUrl } from "@/lib/supabase/public";
import { deleteBrand } from "../actions";

export default function EditBrandPage({ params, searchParams }: PageProps<"/admin/marcas/[id]">) {
  return (
    <main className="max-w-3xl">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-ink-3" />}>
        <Editor params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Editor({ params, searchParams }: PageProps<"/admin/marcas/[id]">) {
  await requireStaff();
  const id = uuid((await params).id);
  if (!id) notFound();
  const { ok, error } = await searchParams;

  const db = await createClient();
  const { data: brand } = await db.from("brands").select("*, brand_translations(*)").eq("id", id).maybeSingle();
  if (!brand) notFound();
  const { data: products } = await db
    .from("products")
    .select("id, slug, status, product_translations(locale, name)")
    .eq("brand_id", id)
    .order("sort_order");
  const name = trOf(brand.brand_translations, "fr")?.name ?? brand.slug;
  const count = products?.length ?? 0;

  return (
    <>
      <AdminHeader title={name} back={{ href: "/admin/marcas", label: "Marcas" }} />
      <OkNotice code={ok} />
      {error === "in-use" && (
        <p role="alert" className="mb-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          No se puede eliminar: la marca tiene productos asociados.
        </p>
      )}
      <BrandForm brand={brand} />

      <div className="mt-8">
        <BrandImages brandId={id} logoUrl={mediaUrl(brand.logo_path)} coverUrl={mediaUrl(brand.cover_path)} />
      </div>

      <section className="mt-12" aria-labelledby="h-brand-products">
        <h2 id="h-brand-products" className="text-sm font-bold uppercase tracking-wider text-muted-dark">
          Productos de esta marca ({count})
        </h2>
        {count ? (
          <ul className="mt-3 divide-y divide-line-dark rounded-2xl border border-line-dark bg-ink">
            {products!.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/productos/${p.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-ink-3">
                  <span className="truncate">{trOf(p.product_translations, "fr")?.name ?? p.slug}</span>
                  <Badge on={p.status === "published"} onLabel="Publicado" offLabel="Borrador" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-dark">Ningún producto asociado.</p>
        )}
      </section>

      <section className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line-dark pt-6">
        <Link href={`/marques/${brand.slug}`} target="_blank" className="text-sm font-semibold text-lime hover:underline">
          Ver en la web ↗
        </Link>
        <DeleteForm
          action={deleteBrand.bind(null, id)}
          confirmText={`¿Eliminar la marca «${name}»? Esta acción no se puede deshacer.`}
          disabledReason={count ? `tiene ${count} producto(s). Reasígnalos o elimínalos antes.` : undefined}
        />
      </section>
    </>
  );
}
