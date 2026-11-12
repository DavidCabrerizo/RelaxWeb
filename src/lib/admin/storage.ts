import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { detectImageKind, MAX_UPLOAD_BYTES } from "@/lib/media/signature";

type DB = SupabaseClient<Database>;
export const BUCKET = "media";

/**
 * Verificación en el SERVIDOR de un archivo ya subido:
 * existe, pesa como máximo 5 MB y sus primeros bytes son de JPEG/PNG/WebP/AVIF.
 * Si no cumple, se borra del bucket.
 */
export async function verifyUploadedImage(db: DB, path: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { data, error } = await db.storage.from(BUCKET).download(path);
  if (error || !data) return { ok: false, reason: "No se encuentra el archivo subido." };

  if (data.size > MAX_UPLOAD_BYTES) {
    await removeFiles(db, [path]);
    return { ok: false, reason: "El archivo supera 5 MB." };
  }
  const head = new Uint8Array(await data.slice(0, 32).arrayBuffer());
  if (!detectImageKind(head)) {
    await removeFiles(db, [path]);
    return { ok: false, reason: "El archivo no es una imagen JPG, PNG, WebP o AVIF válida." };
  }
  return { ok: true };
}

export async function removeFiles(db: DB, paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => Boolean(p) && !/^https?:\/\//.test(p!));
  if (!list.length) return;
  const { error } = await db.storage.from(BUCKET).remove(list);
  if (error) console.error("[storage] no se pudieron borrar archivos", error.message);
}

/** Borra todo lo que haya bajo una carpeta (p. ej. products/{id}/ al eliminar el producto). */
export async function removeFolder(db: DB, folder: string) {
  const { data } = await db.storage.from(BUCKET).list(folder, { limit: 1000 });
  await removeFiles(db, (data ?? []).map((f) => `${folder}/${f.name}`));
}
