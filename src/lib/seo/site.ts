/** URL absoluta del sitio (sin barra final). Definir NEXT_PUBLIC_SITE_URL en Vercel. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}
