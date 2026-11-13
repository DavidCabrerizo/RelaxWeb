import "server-only";
import { supabaseOrigin } from "@/lib/security/headers";

const MAX_BYTES = 12 * 1024 * 1024;

/**
 * Descarga una imagen del almacenamiento de la web para componer la imagen al compartir.
 * Solo acepta el origen de Supabase del proyecto (o la propia web): nunca una URL arbitraria.
 */
export async function fetchStoredImage(url: string, base: string): Promise<Buffer | null> {
  let target: URL;
  try {
    target = new URL(url, base);
  } catch {
    return null;
  }
  const allowed = [supabaseOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL), new URL(base).origin].filter(Boolean);
  if (!allowed.includes(target.origin)) return null;

  try {
    const res = await fetch(target, { signal: AbortSignal.timeout(6000) });
    if (!res.ok || !(res.headers.get("content-type") ?? "").startsWith("image/")) return null;
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > MAX_BYTES) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > MAX_BYTES ? null : buf;
  } catch {
    return null;
  }
}
