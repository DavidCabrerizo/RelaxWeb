import "server-only";

/** El archivo pedido es «<slug>.jpg»: devuelve el slug o null si no es válido. */
export function slugFromFile(file: string): string | null {
  const m = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.jpg$/.exec(file);
  return m ? m[1] : null;
}

/**
 * JPEG generado. La URL lleva ?v=<versión>, que cambia al editar el producto o la marca:
 * por eso el CDN y las redes pueden guardarla mucho tiempo sin mostrar una imagen antigua.
 */
export function jpeg(body: Buffer) {
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400",
    },
  });
}

/** Sin imagen propia: el logo de la tienda (redirección temporal, por si luego se añade una foto). */
export function fallback(req: Request) {
  return Response.redirect(new URL("/og.jpg", req.url), 302);
}
