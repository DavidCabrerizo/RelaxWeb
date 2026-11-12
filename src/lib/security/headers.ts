/**
 * Cabeceras de seguridad HTTP. Se aplican desde next.config.ts a todas las respuestas.
 *
 * CSP sin nonce, a propósito: con Cache Components las páginas se prerenderizan (estáticas o
 * parciales) y Next 16 no puede inyectar un nonce en HTML generado en el build. Un nonce
 * obligaría a renderizar todo en cada visita y perder el CDN (peor LCP y más coste).
 * Por eso scripts y estilos inline se permiten ('unsafe-inline'), y el resto se cierra:
 * sin orígenes externos de scripts, sin <object>, sin <base> ajeno, formularios solo
 * hacia la propia web, nadie puede enmarcar la web e iframes solo de Google Maps.
 * La web nunca pinta HTML del panel: React escapa todo el texto y el JSON-LD se
 * serializa escapando "<", ">" y "&".
 */

type Options = { supabaseUrl?: string; isDev?: boolean };

/** Origen (https://xxxx.supabase.co) de la URL de Supabase, o null si no es válida. */
export function supabaseOrigin(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.hostname === "localhost" || u.hostname === "127.0.0.1" ? u.origin : null;
  } catch {
    return null;
  }
}

export function contentSecurityPolicy({ supabaseUrl, isDev = false }: Options = {}): string {
  const sb = supabaseOrigin(supabaseUrl);
  const sbWs = sb ? sb.replace(/^http/, "ws") : null;

  const directives: Record<string, (string | null | false)[]> = {
    "default-src": ["'self'"],
    // 'unsafe-eval' solo en desarrollo (React lo usa para reconstruir trazas de error)
    "script-src": ["'self'", "'unsafe-inline'", isDev && "'unsafe-eval'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    // Fotos del bucket (vista previa del panel y galería) y miniaturas locales (blob:)
    "img-src": ["'self'", "data:", "blob:", sb],
    "font-src": ["'self'"],
    // Subida directa a Storage y sesión de Supabase desde el panel
    "connect-src": ["'self'", sb, sbWs, isDev && "ws:"],
    // Mapa de la página de contacto (solo con consentimiento)
    "frame-src": ["https://www.google.com", "https://maps.google.com"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "media-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  const parts = Object.entries(directives).map(([k, v]) => [k, ...v.filter(Boolean)].join(" "));
  if (!isDev) parts.push("upgrade-insecure-requests");
  return parts.join("; ");
}

export function securityHeaders(opts: Options = {}): { key: string; value: string }[] {
  const headers = [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(opts) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Equivalente antiguo de frame-ancestors 'none' para navegadores sin CSP 3
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    // La web no usa cámara, micrófono, ubicación ni pagos: se desactivan para todo el sitio
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    },
  ];
  // HSTS solo en producción (en localhost forzaría HTTPS). Dos años, con subdominios; sin
  // "preload" porque inscribirse en la lista de precarga es una decisión del dueño del dominio.
  if (!opts.isDev) headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" });
  return headers;
}
