import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/config";

/**
 * 1) /admin: refresca la sesión de Supabase (cookies) y envía a /admin/login si no hay usuario.
 *    Es la PRIMERA capa. La autorización real (rol) se comprueba en el servidor
 *    (lib/auth/guard.ts) y en la base de datos (RLS).
 * 2) Web pública: enrutado de idiomas
 *    /fr/... → 308 a /...   ·   /en/... → tal cual   ·   /... → reescritura interna a /fr/...
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminSession(request);
  return localeRouting(request);
}

async function adminSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const isLogin = request.nextUrl.pathname === "/admin/login";
  if (!url || !key) {
    // Sin Supabase configurado el panel no puede funcionar: todo va al login, que lo explica
    return isLogin ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims valida el JWT de la sesión (y la refresca si hace falta)
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  if (!signedIn && !isLogin) {
    const login = new URL("/admin/login", request.url);
    const redirect = NextResponse.redirect(login);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function localeRouting(request: NextRequest) {
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
    // Todo salvo api, internos de Next y archivos con extensión (incluye /admin)
    "/((?!api|_next|.*\\..*).*)",
  ],
};
