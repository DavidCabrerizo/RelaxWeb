import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminHeader, OkNotice } from "@/components/admin/AdminHeader";
import { DeleteForm } from "@/components/admin/Form";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { trOf } from "@/lib/admin/i18n";
import { uuid } from "@/lib/admin/form";
import { brandAndCategoryOptions } from "@/lib/admin/options";
import { ProductForm } from "../ProductForm";
import { deleteProduct } from "../actions";

const ERRORS: Record<string, string> = {
  "missing-short": "Para publicar, añade antes una descripción corta en francés.",
  delete: "No se ha podido eliminar el producto.",
};

export default function EditProductPage({ params, searchParams }: PageProps<"/admin/productos/[id]">) {
  return (
    <main className="max-w-3xl">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-ink-3" />}>
        <Editor params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Editor({ params, searchParams }: PageProps<"/admin/productos/[id]">) {
  await requireStaff();
  const id = uuid((await params).id);
  if (!id) notFound();
  const { ok, error } = await searchParams;
  const errorKey = Array.isArray(error) ? error[0] : error;

  const db = await createClient();
  const [{ data: product }, options] = await Promise.all([
    db.from("products").select("*, product_translations(*)").eq("id", id).maybeSingle(),
    brandAndCategoryOptions(),
  ]);
  if (!product) notFound();
  const name = trOf(product.product_translations, "fr")?.name ?? product.slug;

  return (
    <>
      <AdminHeader title={name} back={{ href: "/admin/productos", label: "Productos" }} />
      <OkNotice code={ok} />
      {errorKey && ERRORS[errorKey] && (
        <p role="alert" className="mb-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {ERRORS[errorKey]}
        </p>
      )}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href={`/admin/productos/${id}/apercu`} className="rounded-full border border-lime px-4 py-2 text-xs font-bold uppercase text-lime hover:bg-lime hover:text-ink">
          Vista previa
        </Link>
        {product.status === "published" && (
          <Link href={`/produits/${product.slug}`} target="_blank" className="rounded-full border border-line-dark px-4 py-2 text-xs font-bold uppercase text-paper/80 hover:text-lime">
            Ver en la web ↗
          </Link>
        )}
      </div>

      <ProductForm product={product} brands={options.brands} categories={options.categories} />

      <section className="mt-12 flex justify-end border-t border-line-dark pt-6">
        <DeleteForm action={deleteProduct.bind(null, id)} confirmText={`¿Eliminar «${name}»? Esta acción no se puede deshacer.`} />
      </section>
    </>
  );
}
