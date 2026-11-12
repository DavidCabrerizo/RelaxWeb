/**
 * Detección del tipo REAL de una imagen por sus primeros bytes ("magic numbers"),
 * sin fiarse de la extensión ni del Content-Type declarado por el navegador.
 * Solo se aceptan formatos de imagen rasterizada: JPEG, PNG, WebP y AVIF.
 * (SVG queda excluido a propósito: puede contener scripts.)
 */
export type ImageKind = "jpeg" | "png" | "webp" | "avif";

export function detectImageKind(bytes: Uint8Array): ImageKind | null {
  const b = bytes;
  const ascii = (start: number, len: number) => String.fromCharCode(...b.subarray(start, start + len));

  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b.length >= 8 && b[0] === 0x89 && ascii(1, 3) === "PNG" && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return "png";
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "webp";
  if (b.length >= 12 && ascii(4, 4) === "ftyp" && ["avif", "avis"].includes(ascii(8, 4))) return "avif";
  return null;
}

export const KIND_EXT: Record<ImageKind, string> = { jpeg: "jpg", png: "png", webp: "webp", avif: "avif" };

/** Límite del bucket "media" (también configurado en Supabase Storage). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
/** Límite del archivo ORIGINAL que se acepta en el navegador antes de comprimir. */
export const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

/**
 * Rutas permitidas en el bucket. Se generan en el navegador pero se VALIDAN en el servidor:
 * un editor no puede registrar un archivo de otro producto ni rutas arbitrarias.
 *   products/{productId}/{uuid}.{ext}
 *   brands/{brandId}/{logo|cover}-{uuid}.{ext}
 */
export function isProductImagePath(path: string, productId: string): boolean {
  return new RegExp(`^products/${productId}/${UUID}\\.(webp|jpg|png|avif)$`).test(path);
}

export function isBrandImagePath(path: string, brandId: string, kind: "logo" | "cover"): boolean {
  return new RegExp(`^brands/${brandId}/${kind}-${UUID}\\.(webp|jpg|png|avif)$`).test(path);
}
