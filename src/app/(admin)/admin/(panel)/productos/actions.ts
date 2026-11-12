"use server";

import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { bool, dbErrorMessage, int, SLUG_RE, slugify, str, translations, uuid, type ActionState } from "@/lib/admin/form";
import { splitLocales, validateTranslations } from "@/lib/admin/i18n";
import { refreshPublicContent } from "@/lib/admin/revalidate";
import { removeFolder } from "@/lib/admin/storage";

const FIELDS = { name: 120, short_description: 300, description: 5000, seo_title: 70, seo_description: 170 };

/** Características: una por línea (máx. 20 líneas de 120 caracteres). */
function features(form: FormData, locale: string): string[] {
  return (str(form, `features_${locale}`, 3000) ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 20);
}

export async function saveProduct(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const id = uuid(form, "id");
  const slug = slugify(str(form, "slug", 120) ?? "");
  const brandId = uuid(form, "brand_id");
  const categoryId = uuid(form, "category_id");
  const status = form.get("status") === "published" ? "published" : "draft";
  const tr = translations(form, FIELDS);

  const errors: Record<string, string> = {};
  if (!SLUG_RE.test(slug)) errors.slug = "Usa solo minúsculas, números y guiones.";
  if (!brandId) errors.brand_id = "Elige una marca.";
  if (!categoryId) errors.category_id = "Elige una categoría.";
  validateTranslations(tr, "name", errors);
  if (status === "published" && !tr.fr.short_description) {
    errors.short_description_fr = "Para publicar, añade una descripción corta en francés.";
  }
  if (Object.keys(errors).length) return { errors, message: "Revisa los campos marcados." };

  const db = await createClient();
  const base = {
    slug,
    brand_id: brandId,
    category_id: categoryId,
    status: status as "draft" | "published",
    is_featured: bool(form, "is_featured"),
    sort_order: int(form, "sort_order"),
  };

  let productId = id;
  if (id) {
    const { error } = await db.from("products").update(base).eq("id", id);
    if (error) return { message: dbErrorMessage(error), errors: error.code === "23505" ? { slug: "Slug ya en uso." } : undefined };
  } else {
    const { data, error } = await db.from("products").insert(base).select("id").single();
    if (error) return { message: dbErrorMessage(error), errors: error.code === "23505" ? { slug: "Slug ya en uso." } : undefined };
    productId = data.id;
  }

  const { filled, empty } = splitLocales(tr, "name");
  const { error: trError } = await db.from("product_translations").upsert(
    filled.map((locale) => ({
      product_id: productId!,
      locale,
      ...tr[locale],
      name: tr[locale].name!,
      features: features(form, locale),
    })),
    { onConflict: "product_id,locale" },
  );
  if (trError) return { message: dbErrorMessage(trError) };
  if (empty.length) await db.from("product_translations").delete().eq("product_id", productId!).in("locale", empty);

  refreshPublicContent();
  if (!id) redirect(`/admin/productos/${productId}?ok=created`);
  return { ok: true, message: status === "published" ? "Guardado y publicado." : "Guardado como borrador." };
}

/** Acciones rápidas desde la lista: publicar/despublicar y destacar. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function toggleProduct(rawId: string, field: "status" | "featured", _form: FormData) {
  await requireStaff();
  const id = uuid(rawId);
  if (!id || (field !== "status" && field !== "featured")) return;
  const db = await createClient();
  const { data: p } = await db.from("products").select("status, is_featured, product_translations(locale, short_description)").eq("id", id).maybeSingle();
  if (!p) return;

  if (field === "status") {
    const next = p.status === "published" ? "draft" : "published";
    // Mismo requisito que el formulario: no se publica sin descripción corta en francés
    const fr = p.product_translations.find((t) => t.locale === "fr");
    if (next === "published" && !fr?.short_description) redirect(`/admin/productos/${id}?error=missing-short`);
    await db.from("products").update({ status: next }).eq("id", id);
  } else {
    await db.from("products").update({ is_featured: !p.is_featured }).eq("id", id);
  }
  refreshPublicContent();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteProduct(rawId: string, _form: FormData) {
  await requireStaff();
  const id = uuid(rawId);
  if (!id) return;
  const db = await createClient();
  // Traducciones y filas de imágenes se borran en cascada; los archivos del bucket, aquí
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) redirect(`/admin/productos/${id}?error=delete`);
  await removeFolder(db, `products/${id}`);
  refreshPublicContent();
  redirect("/admin/productos?ok=deleted");
}
