/**
 * Compresión en el NAVEGADOR antes de subir:
 *  - Comprueba que el archivo se decodifica como imagen (un .exe renombrado falla aquí).
 *  - Reduce al lado mayor indicado y convierte a WebP (calidad 0.85).
 *  - Si el navegador no sabe codificar WebP (Safari antiguo), usa JPEG para fotos
 *    o PNG para logos (para no perder la transparencia).
 *  - Elimina metadatos EXIF (ubicación GPS del móvil, etc.) al redibujar en un canvas.
 */
import { MAX_SOURCE_BYTES, MAX_UPLOAD_BYTES } from "./signature";

export type Compressed = { blob: Blob; ext: "webp" | "jpg" | "png"; width: number; height: number };

export class ImageError extends Error {}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif", ""];

export async function compressImage(file: File, opts: { maxSide: number; keepAlpha?: boolean }): Promise<Compressed> {
  if (file.size > MAX_SOURCE_BYTES) throw new ImageError("El archivo supera 25 MB.");
  if (!ACCEPTED.includes(file.type)) throw new ImageError("Formato no admitido. Usa JPG, PNG, WebP o AVIF.");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageError("El archivo no es una imagen válida o el navegador no puede leerla.");
  }

  const scale = Math.min(1, opts.maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageError("No se ha podido procesar la imagen.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const toBlob = (type: string, q?: number) => new Promise<Blob | null>((res) => canvas.toBlob(res, type, q));

  let blob = await toBlob("image/webp", 0.85);
  let ext: Compressed["ext"] = "webp";
  if (!blob || blob.type !== "image/webp") {
    if (opts.keepAlpha) {
      blob = await toBlob("image/png");
      ext = "png";
    } else {
      blob = await toBlob("image/jpeg", 0.85);
      ext = "jpg";
    }
  }
  if (!blob) throw new ImageError("No se ha podido comprimir la imagen.");
  if (blob.size > MAX_UPLOAD_BYTES) throw new ImageError("La imagen sigue ocupando más de 5 MB tras comprimirla.");
  return { blob, ext, width, height };
}
