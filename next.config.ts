import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security/headers";

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  experimental: {
    // CSS dentro del HTML (≈9 KB comprimida con Tailwind): sin petición que bloquee el primer pintado
    inlineCss: true,
  },
  async headers() {
    const headers = securityHeaders({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      isDev: process.env.NODE_ENV === "development",
    });
    return [{ source: "/:path*", headers }];
  },
  images: {
    // Imágenes subidas al bucket público "media" de Supabase
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/media/**" }],
    formats: ["image/avif", "image/webp"],
  },
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
