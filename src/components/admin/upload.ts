"use client";

import { createClient } from "@/lib/supabase/client";
import { compressImage, ImageError } from "@/lib/media/compress";

/**
 * Comprime y sube un archivo al bucket "media" con la sesión del editor.
 * La política de Storage solo permite subir al staff; el servidor vuelve a verificar
 * el archivo antes de registrarlo en la base de datos.
 */
export async function compressAndUpload(file: File, folder: string, opts: { maxSide: number; keepAlpha?: boolean; prefix?: string }) {
  const img = await compressImage(file, opts);
  const name = `${opts.prefix ?? ""}${crypto.randomUUID()}.${img.ext}`;
  const path = `${folder}/${name}`;
  const { error } = await createClient()
    .storage.from("media")
    .upload(path, img.blob, {
      contentType: img.blob.type,
      cacheControl: "31536000", // nombre único por archivo: se puede cachear un año
      upsert: false,
    });
  if (error) throw new ImageError(error.message.includes("size") ? "El archivo es demasiado grande." : "No se ha podido subir la imagen.");
  return { path, width: img.width, height: img.height };
}

export const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
export { ImageError };
