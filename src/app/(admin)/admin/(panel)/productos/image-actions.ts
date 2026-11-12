"use server";

import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { uuid } from "@/lib/admin/form";
import { refreshPublicContent } from "@/lib/admin/revalidate";
import { removeFiles, verifyUploadedImage } from "@/lib/admin/storage";
import { isProductImagePath } from "@/lib/media/signature";

export type ImageResult = { ok: boolean; message?: string };
type Uploaded = { path: string; width: number; height: number };

const dim = (n: unknown) => (Number.isInteger(n) && (n as number) > 0 && (n as number) <= 10000 ? (n as number) : null);
const MAX_IMAGES = 12;

/** Registra fotos ya subidas al bucket (tras verificarlas en el servidor). */
export async function registerProductImages(rawProductId: string, uploads: Uploaded[]): Promise<ImageResult> {
  await requireStaff();
  const productId = uuid(rawProductId);
  if (!productId || !Array.isArray(uploads) || !uploads.length) return { ok: false, message: "Datos no válidos." };

  const db = await createClient();
  const { data: existing } = await db.from("product_images").select("id, sort_order, is_primary").eq("product_id", productId);
  if ((existing?.length ?? 0) + uploads.length > MAX_IMAGES) {
    await removeFiles(db, uploads.map((u) => u.path).filter((p) => isProductImagePath(p, productId)));
    return { ok: false, message: `Máximo ${MAX_IMAGES} fotos por producto.` };
  }

  const valid: Uploaded[] = [];
  const problems: string[] = [];
  for (const u of uploads.slice(0, MAX_IMAGES)) {
    if (typeof u?.path !== "string" || !isProductImagePath(u.path, productId)) {
      problems.push("ruta no válida");
      continue;
    }
    const check = await verifyUploadedImage(db, u.path);
    if (check.ok) valid.push(u);
    else problems.push(check.reason);
  }
  if (!valid.length) return { ok: false, message: problems[0] ?? "No se ha podido guardar ninguna imagen." };

  let order = Math.max(-1, ...(existing ?? []).map((i) => i.sort_order));
  const hasPrimary = (existing ?? []).some((i) => i.is_primary);
  const { error } = await db.from("product_images").insert(
    valid.map((u, i) => ({
      product_id: productId,
      storage_path: u.path,
      width: dim(u.width),
      height: dim(u.height),
      sort_order: ++order,
      is_primary: !hasPrimary && i === 0,
    })),
  );
  if (error) {
    await removeFiles(db, valid.map((v) => v.path));
    return { ok: false, message: "No se han podido guardar las imágenes." };
  }

  refreshPublicContent();
  return {
    ok: true,
    message: problems.length ? `${valid.length} imagen(es) añadidas; ${problems.length} rechazada(s): ${problems[0]}` : undefined,
  };
}

async function loadImage(rawImageId: string) {
  await requireStaff();
  const id = uuid(rawImageId);
  if (!id) return null;
  const db = await createClient();
  const { data } = await db.from("product_images").select("id, product_id, storage_path, is_primary, sort_order").eq("id", id).maybeSingle();
  return data ? { db, image: data } : null;
}

export async function setPrimaryImage(rawImageId: string): Promise<ImageResult> {
  const ctx = await loadImage(rawImageId);
  if (!ctx) return { ok: false, message: "Imagen no encontrada." };
  const { db, image } = ctx;
  // Índice único parcial: primero se quita la principal actual y después se marca la nueva
  await db.from("product_images").update({ is_primary: false }).eq("product_id", image.product_id).eq("is_primary", true);
  const { error } = await db.from("product_images").update({ is_primary: true }).eq("id", image.id);
  if (error) return { ok: false, message: "No se ha podido cambiar la imagen principal." };
  refreshPublicContent();
  return { ok: true };
}

export async function moveImage(rawImageId: string, direction: "up" | "down"): Promise<ImageResult> {
  const ctx = await loadImage(rawImageId);
  if (!ctx || (direction !== "up" && direction !== "down")) return { ok: false, message: "Imagen no encontrada." };
  const { db, image } = ctx;
  const { data: all } = await db.from("product_images").select("id, sort_order").eq("product_id", image.product_id).order("sort_order").order("created_at");
  const list = [...(all ?? [])];
  const i = list.findIndex((x) => x.id === image.id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= list.length) return { ok: true };
  [list[i], list[j]] = [list[j], list[i]];
  // Se renumera todo (0..n) para evitar empates heredados
  await Promise.all(list.map((x, idx) => (x.sort_order === idx ? null : db.from("product_images").update({ sort_order: idx }).eq("id", x.id))));
  refreshPublicContent();
  return { ok: true };
}

export async function updateImageAlt(rawImageId: string, altFr: string, altEn: string): Promise<ImageResult> {
  const ctx = await loadImage(rawImageId);
  if (!ctx) return { ok: false, message: "Imagen no encontrada." };
  const clean = (s: unknown) => (typeof s === "string" ? s.trim().slice(0, 160) : "");
  const alt: Record<string, string> = {};
  if (clean(altFr)) alt.fr = clean(altFr);
  if (clean(altEn)) alt.en = clean(altEn);
  const { error } = await ctx.db.from("product_images").update({ alt }).eq("id", ctx.image.id);
  if (error) return { ok: false, message: "No se ha podido guardar el texto alternativo." };
  refreshPublicContent();
  return { ok: true, message: "Texto alternativo guardado." };
}

/** Sustituye el archivo de una foto conservando su posición, principal y textos alternativos. */
export async function replaceProductImage(rawImageId: string, upload: Uploaded): Promise<ImageResult> {
  const ctx = await loadImage(rawImageId);
  if (!ctx) return { ok: false, message: "Imagen no encontrada." };
  const { db, image } = ctx;
  if (typeof upload?.path !== "string" || !isProductImagePath(upload.path, image.product_id)) {
    return { ok: false, message: "Ruta no válida." };
  }
  const check = await verifyUploadedImage(db, upload.path);
  if (!check.ok) return { ok: false, message: check.reason };

  const { error } = await db
    .from("product_images")
    .update({ storage_path: upload.path, width: dim(upload.width), height: dim(upload.height) })
    .eq("id", image.id);
  if (error) {
    await removeFiles(db, [upload.path]);
    return { ok: false, message: "No se ha podido sustituir la imagen." };
  }
  await removeFiles(db, [image.storage_path]);
  refreshPublicContent();
  return { ok: true };
}

export async function deleteProductImage(rawImageId: string): Promise<ImageResult> {
  const ctx = await loadImage(rawImageId);
  if (!ctx) return { ok: false, message: "Imagen no encontrada." };
  const { db, image } = ctx;
  const { error } = await db.from("product_images").delete().eq("id", image.id);
  if (error) return { ok: false, message: "No se ha podido eliminar la imagen." };
  await removeFiles(db, [image.storage_path]);

  // Si era la principal, la siguiente pasa a serlo
  if (image.is_primary) {
    const { data: next } = await db.from("product_images").select("id").eq("product_id", image.product_id).order("sort_order").limit(1).maybeSingle();
    if (next) await db.from("product_images").update({ is_primary: true }).eq("id", next.id);
  }
  refreshPublicContent();
  return { ok: true };
}
