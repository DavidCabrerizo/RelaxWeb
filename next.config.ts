import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // partialPrefetching desactivado: con él, una ficha inexistente (/produits/x) responde 200
  // porque el streaming empieza antes de notFound(). Sin él, devuelve un 404 real (mejor para SEO).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
