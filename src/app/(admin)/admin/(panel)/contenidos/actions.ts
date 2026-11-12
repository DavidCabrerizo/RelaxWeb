"use server";

import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_LOCALES, dbErrorMessage, str, type ActionState } from "@/lib/admin/form";
import { refreshPublicContent } from "@/lib/admin/revalidate";
import { removeFiles, verifyUploadedImage } from "@/lib/admin/storage";
import { CONTENT_BLOCKS } from "@/lib/content/blocks";
import { CONTENT_IMAGE_SLOTS, isContentImagePath, type ContentImageSlot } from "@/lib/media/signature";

/** Guarda un bloque de textos (todos sus idiomas). Campo vacío = se usa el texto por defecto. */
export async function saveBlock(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const key = String(form.get("key") ?? "");
  const block = CONTENT_BLOCKS.find((b) => b.key === key);
  if (!block) return { message: "Bloque desconocido." };

  const db = await createClient();
  for (const locale of ADMIN_LOCALES) {
    const content: Record<string, string> = {};
    for (const f of block.fields) {
      const v = str(form, `${f.name}_${locale}`, f.max);
      if (v) content[f.name] = v;
    }
    const { error } = Object.keys(content).length
      ? await db.from("page_content").upsert({ key, locale, content }, { onConflict: "key,locale" })
      : await db.from("page_content").delete().eq("key", key).eq("locale", locale);
    if (error) return { message: dbErrorMessage(error) };
  }

  refreshPublicContent();
  return { ok: true, message: "Textos guardados." };
}

type Result = { ok: boolean; message?: string };
const rowKey = (slot: ContentImageSlot) => `images.${slot}`;

async function currentPath(db: Awaited<ReturnType<typeof createClient>>, slot: ContentImageSlot) {
  const { data } = await db.from("page_content").select("content").eq("key", rowKey(slot)).eq("locale", "fr").maybeSingle();
  const c = data?.content as { path?: string } | null;
  return typeof c?.path === "string" ? c.path : null;
}

export async function setContentImage(slot: ContentImageSlot, upload: { path: string }): Promise<Result> {
  await requireStaff();
  if (!(CONTENT_IMAGE_SLOTS as readonly string[]).includes(slot)) return { ok: false, message: "Hueco no válido." };
  if (typeof upload?.path !== "string" || !isContentImagePath(upload.path, slot)) return { ok: false, message: "Ruta no válida." };

  const db = await createClient();
  const check = await verifyUploadedImage(db, upload.path);
  if (!check.ok) return { ok: false, message: check.reason };

  const previous = await currentPath(db, slot);
  const { error } = await db
    .from("page_content")
    .upsert({ key: rowKey(slot), locale: "fr", content: { path: upload.path } }, { onConflict: "key,locale" });
  if (error) {
    await removeFiles(db, [upload.path]);
    return { ok: false, message: "No se ha podido guardar la imagen." };
  }
  await removeFiles(db, [previous]);
  refreshPublicContent();
  return { ok: true };
}

export async function removeContentImage(slot: ContentImageSlot): Promise<Result> {
  await requireStaff();
  if (!(CONTENT_IMAGE_SLOTS as readonly string[]).includes(slot)) return { ok: false, message: "Hueco no válido." };
  const db = await createClient();
  const previous = await currentPath(db, slot);
  const { error } = await db.from("page_content").delete().eq("key", rowKey(slot)).eq("locale", "fr");
  if (error) return { ok: false, message: "No se ha podido quitar la imagen." };
  await removeFiles(db, [previous]);
  refreshPublicContent();
  return { ok: true };
}
