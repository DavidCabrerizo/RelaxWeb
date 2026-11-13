import { getProduct } from "@/lib/content/repository";
import { photoOg } from "@/lib/og/compose";
import { fetchStoredImage } from "@/lib/og/fetch-image";
import { fallback, jpeg, slugFromFile } from "@/lib/og/respond";

/** Imagen al compartir de un producto: su foto principal en 1200×630 (/og/produit/<slug>.jpg). */
export async function GET(req: Request, ctx: RouteContext<"/og/produit/[file]">) {
  const slug = slugFromFile((await ctx.params).file);
  if (!slug) return new Response("Not found", { status: 404 });

  const product = await getProduct(slug, "fr");
  if (!product) return new Response("Not found", { status: 404 });

  const photo = product.images[0] ? await fetchStoredImage(product.images[0].url, req.url) : null;
  if (!photo) return fallback(req);
  try {
    return jpeg(await photoOg(photo));
  } catch {
    return fallback(req);
  }
}
