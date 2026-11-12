"use server";

import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_ICONS } from "@/components/brand/CategoryIcon";
import { bool, dbErrorMessage, int, SLUG_RE, slugify, str, translations, uuid, type ActionState } from "@/lib/admin/form";
import { splitLocales, validateTranslations } from "@/lib/admin/i18n";
import { refreshPublicContent } from "@/lib/admin/revalidate";

const FIELDS = { name: 80, description: 2000, seo_title: 70, seo_description: 170 };

export async function saveCategory(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const id = uuid(form, "id");
  const slug = slugify(str(form, "slug", 120) ?? "");
  const icon = String(form.get("icon") ?? "");
  const tr = translations(form, FIELDS);

  const errors: Record<string, string> = {};
  if (!SLUG_RE.test(slug)) errors.slug = "Usa solo minúsculas, números y guiones.";
  if (!(CATEGORY_ICONS as readonly string[]).includes(icon)) errors.icon = "Elige un icono.";
  validateTranslations(tr, "name", errors);
  if (Object.keys(errors).length) return { errors, message: "Revisa los campos marcados." };

  const db = await createClient();
  const base = { slug, icon, sort_order: int(form, "sort_order"), is_published: bool(form, "is_published") };

  let categoryId = id;
  if (id) {
    const { error } = await db.from("categories").update(base).eq("id", id);
    if (error) return { message: dbErrorMessage(error), errors: error.code === "23505" ? { slug: "Slug ya en uso." } : undefined };
  } else {
    const { data, error } = await db.from("categories").insert(base).select("id").single();
    if (error) return { message: dbErrorMessage(error), errors: error.code === "23505" ? { slug: "Slug ya en uso." } : undefined };
    categoryId = data.id;
  }

  const { filled, empty } = splitLocales(tr, "name");
  const { error: trError } = await db.from("category_translations").upsert(
    filled.map((locale) => ({ category_id: categoryId!, locale, ...tr[locale], name: tr[locale].name! })),
    { onConflict: "category_id,locale" },
  );
  if (trError) return { message: dbErrorMessage(trError) };
  if (empty.length) await db.from("category_translations").delete().eq("category_id", categoryId!).in("locale", empty);

  refreshPublicContent();
  if (!id) redirect(`/admin/categorias/${categoryId}?ok=created`);
  return { ok: true, message: "Cambios guardados." };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteCategory(rawId: string, _form: FormData) {
  await requireStaff();
  const id = uuid(rawId); // el id llega del cliente: se valida igualmente
  if (!id) return;
  const db = await createClient();
  // La clave foránea (ON DELETE RESTRICT) impide borrar si hay productos; se comprueba también aquí
  const { count } = await db.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
  if (count) redirect(`/admin/categorias/${id}?error=in-use`);
  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) redirect(`/admin/categorias/${id}?error=in-use`);
  refreshPublicContent();
  redirect("/admin/categorias?ok=deleted");
}
