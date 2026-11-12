import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/config";

/**
 * Enrutado de idiomas:
 *  - /fr/...      → redirección 308 a /... (evita URLs duplicadas del idioma por defecto)
 *  - /en/...      → se sirve tal cual (app/[lang])
 *  - /...         → reescritura interna a /fr/...
 * /admin y /api quedan fuera (no son multidioma). La sesión de Supabase para /admin
 * se añade en la Fase 3.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === `/${DEFAULT_LOCALE}` || pathname.startsWith(`/${DEFAULT_LOCALE}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  const hasSecondaryLocale = SUPPORTED_LOCALES.some(
    (l) => l !== DEFAULT_LOCALE && (pathname === `/${l}` || pathname.startsWith(`/${l}/`)),
  );
  if (hasSecondaryLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    // Todo salvo admin, api, internos de Next y archivos con extensión
    "/((?!admin|api|_next|.*\\..*).*)",
  ],
};
