"use server";

import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { bool, dbErrorMessage, int, SLUG_RE, slugify, str, translations, uuid, type ActionState } from "@/lib/admin/form";
import { splitLocales, validateTranslations } from "@/lib/admin/i18n";
import { refreshPublicContent } from "@/lib/admin/revalidate";

const FIELDS = { name: 80, description: 2000, seo_title: 70, seo_description: 170 };

export async function saveBrand(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const id = uuid(form, "id");
  const slug = slugify(str(form, "slug", 120) ?? "");
  const tr = translations(form, FIELDS);

  const errors: Record<string, string> = {};
  if (!SLUG_RE.test(slug)) errors.slug = "Usa solo minúsculas, números y guiones.";
  validateTranslations(tr, "name", errors);
  if (Object.keys(errors).length) return { errors, message: "Revisa los campos marcados." };

  const db = await createClient();
  const base = {
    slug,
    is_featured: bool(form, "is_featured"),
    is_published: bool(form, "is_published"),
    sort_order: int(form, "sort_order"),
  };

  let brandId = id;
  if (id) {
    const { error } = await db.from("brands").update(base).eq("id", id);
    if (error) return { message: dbErrorMessage(error), errors: error.code === "23505" ? { slug: "Slug ya en uso." } : undefined };
  } else {
    const { data, error } = await db.from("brands").insert(base).select("id").single();
    if (error) return { message: dbErrorMessage(error), errors: error.code === "23505" ? { slug: "Slug ya en uso." } : undefined };
    brandId = data.id;
  }

  const { filled, empty } = splitLocales(tr, "name");
  const { error: trError } = await db.from("brand_translations").upsert(
    filled.map((locale) => ({ brand_id: brandId!, locale, ...tr[locale], name: tr[locale].name! })),
    { onConflict: "brand_id,locale" },
  );
  if (trError) return { message: dbErrorMessage(trError) };
  if (empty.length) await db.from("brand_translations").delete().eq("brand_id", brandId!).in("locale", empty);

  refreshPublicContent();
  if (!id) redirect(`/admin/marcas/${brandId}?ok=created`);
  return { ok: true, message: "Cambios guardados." };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteBrand(rawId: string, _form: FormData) {
  await requireStaff();
  const id = uuid(rawId);
  if (!id) return;
  const db = await createClient();
  const { count } = await db.from("products").select("id", { count: "exact", head: true }).eq("brand_id", id);
  if (count) redirect(`/admin/marcas/${id}?error=in-use`);
  const { error } = await db.from("brands").delete().eq("id", id);
  if (error) redirect(`/admin/marcas/${id}?error=in-use`);
  refreshPublicContent();
  redirect("/admin/marcas?ok=deleted");
}
