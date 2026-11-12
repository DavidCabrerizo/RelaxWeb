import "server-only";
import { updateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/content/supabase-source";

/**
 * Tras cualquier cambio en el panel: invalida la caché del contenido público.
 * updateTag (no revalidateTag) porque el editor espera ver su cambio al instante.
 */
export function refreshPublicContent() {
  updateTag(CONTENT_TAG);
}
