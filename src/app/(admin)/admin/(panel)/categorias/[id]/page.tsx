import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminHeader, OkNotice } from "@/components/admin/AdminHeader";
import { DeleteForm } from "@/components/admin/Form";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { trOf } from "@/lib/admin/i18n";
import { uuid } from "@/lib/admin/form";
import { CategoryForm } from "../CategoryForm";
import { deleteCategory } from "../actions";

export default function EditCategoryPage({ params, searchParams }: PageProps<"/admin/categorias/[id]">) {
  return (
    <main className="max-w-3xl">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-ink-3" />}>
        <Editor params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Editor({ params, searchParams }: PageProps<"/admin/categorias/[id]">) {
  await requireStaff();
  const id = uuid((await params).id);
  if (!id) notFound();
  const { ok, error } = await searchParams;

  const db = await createClient();
  const { data: category } = await db.from("categories").select("*, category_translations(*)").eq("id", id).maybeSingle();
  if (!category) notFound();
  const { count } = await db.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
  const name = trOf(category.category_translations, "fr")?.name ?? category.slug;

  return (
    <>
      <AdminHeader title={name} back={{ href: "/admin/categorias", label: "Categorías" }} />
      <OkNotice code={ok} />
      {error === "in-use" && (
        <p role="alert" className="mb-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          No se puede eliminar: la categoría tiene productos asociados.
        </p>
      )}
      <CategoryForm category={category} />

      <section className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line-dark pt-6">
        <Link href={`/categories/${category.slug}`} target="_blank" className="text-sm font-semibold text-lime hover:underline">
          Ver en la web ↗
        </Link>
        <DeleteForm
          action={deleteCategory.bind(null, id)}
          confirmText={`¿Eliminar la categoría «${name}»? Esta acción no se puede deshacer.`}
          disabledReason={count ? `tiene ${count} producto(s). Muévelos a otra categoría antes de eliminarla.` : undefined}
        />
      </section>
    </>
  );
}

