import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/metadata";

/** /robots.txt: se indexa la web pública; el panel y la API quedan fuera. */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
