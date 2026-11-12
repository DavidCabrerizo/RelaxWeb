"use server";

import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_LOCALES, dbErrorMessage, str, type ActionState } from "@/lib/admin/form";
import { refreshPublicContent } from "@/lib/admin/revalidate";
import { STATIC_PAGES } from "@/lib/seo/metadata";

/** Guarda el SEO de una página fija en todos los idiomas. Vacío y sin noindex = se usan los textos por defecto. */
export async function saveSeoPage(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const pageKey = String(form.get("page_key") ?? "");
  if (!STATIC_PAGES.some((p) => p.key === pageKey)) return { message: "Página desconocida." };

  const db = await createClient();
  for (const locale of ADMIN_LOCALES) {
    const title = str(form, `title_${locale}`, 70);
    const description = str(form, `description_${locale}`, 170);
    const noindex = form.get(`noindex_${locale}`) === "on";
    const { error } =
      title || description || noindex
        ? await db.from("seo_metadata").upsert({ page_key: pageKey, locale, title, description, noindex }, { onConflict: "page_key,locale" })
        : await db.from("seo_metadata").delete().eq("page_key", pageKey).eq("locale", locale);
    if (error) return { message: dbErrorMessage(error) };
  }

  refreshPublicContent();
  return { ok: true, message: "SEO guardado." };
}
