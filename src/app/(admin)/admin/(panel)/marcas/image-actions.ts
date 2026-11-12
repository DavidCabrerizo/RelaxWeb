"use server";

import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { uuid } from "@/lib/admin/form";
import { refreshPublicContent } from "@/lib/admin/revalidate";
import { removeFiles, verifyUploadedImage } from "@/lib/admin/storage";
import { isBrandImagePath } from "@/lib/media/signature";

type Kind = "logo" | "cover";
export type BrandImageResult = { ok: boolean; message?: string };

const column = (kind: Kind) => (kind === "logo" ? "logo_path" : "cover_path");
/** Objeto de actualización tipado (las claves calculadas no se pueden verificar). */
const patch = (kind: Kind, value: string | null) => (kind === "logo" ? { logo_path: value } : { cover_path: value });

/** Asigna un logotipo o portada ya subido (verificado en el servidor) y borra el anterior. */
export async function setBrandImage(rawBrandId: string, kind: Kind, upload: { path: string }): Promise<BrandImageResult> {
  await requireStaff();
  const brandId = uuid(rawBrandId);
  if (!brandId || (kind !== "logo" && kind !== "cover")) return { ok: false, message: "Datos no válidos." };
  if (typeof upload?.path !== "string" || !isBrandImagePath(upload.path, brandId, kind)) return { ok: false, message: "Ruta no válida." };

  const db = await createClient();
  const check = await verifyUploadedImage(db, upload.path);
  if (!check.ok) return { ok: false, message: check.reason };

  const { data: brand } = await db.from("brands").select("logo_path, cover_path").eq("id", brandId).maybeSingle();
  if (!brand) {
    await removeFiles(db, [upload.path]);
    return { ok: false, message: "Marca no encontrada." };
  }
  const { error } = await db.from("brands").update(patch(kind, upload.path)).eq("id", brandId);
  if (error) {
    await removeFiles(db, [upload.path]);
    return { ok: false, message: "No se ha podido guardar la imagen." };
  }
  await removeFiles(db, [brand[column(kind)]]);
  refreshPublicContent();
  return { ok: true };
}

export async function removeBrandImage(rawBrandId: string, kind: Kind): Promise<BrandImageResult> {
  await requireStaff();
  const brandId = uuid(rawBrandId);
  if (!brandId || (kind !== "logo" && kind !== "cover")) return { ok: false, message: "Datos no válidos." };
  const db = await createClient();
  const { data: brand } = await db.from("brands").select("logo_path, cover_path").eq("id", brandId).maybeSingle();
  if (!brand) return { ok: false, message: "Marca no encontrada." };
  const { error } = await db.from("brands").update(patch(kind, null)).eq("id", brandId);
  if (error) return { ok: false, message: "No se ha podido quitar la imagen." };
  await removeFiles(db, [brand[column(kind)]]);
  refreshPublicContent();
  return { ok: true };
}
