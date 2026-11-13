import { getBrand } from "@/lib/content/repository";
import { logoOg, photoOg } from "@/lib/og/compose";
import { fetchStoredImage } from "@/lib/og/fetch-image";
import { fallback, jpeg, slugFromFile } from "@/lib/og/respond";

/** Imagen al compartir de una marca: su logo en 1200×630 (o su portada si no tiene logo). */
export async function GET(req: Request, ctx: RouteContext<"/og/marque/[file]">) {
  const slug = slugFromFile((await ctx.params).file);
  if (!slug) return new Response("Not found", { status: 404 });

  const brand = await getBrand(slug, "fr");
  if (!brand) return new Response("Not found", { status: 404 });

  try {
    if (brand.logoUrl) {
      const logo = await fetchStoredImage(brand.logoUrl, req.url);
      if (logo) return jpeg(await logoOg(logo));
    }
    if (brand.coverUrl) {
      const cover = await fetchStoredImage(brand.coverUrl, req.url);
      if (cover) return jpeg(await photoOg(cover));
    }
  } catch {
    // imagen dañada o formato no soportado: se usa el logo de la tienda
  }
  return fallback(req);
}
