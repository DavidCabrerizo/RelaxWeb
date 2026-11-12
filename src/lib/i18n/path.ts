import { SUPPORTED_LOCALES } from "./config";

/**
 * Quita el prefijo de idioma de una ruta.
 * El servidor ve "/fr/produits" (tras la reescritura del proxy) y el navegador "/produits":
 * ambos dan "/produits", así que los componentes cliente no provocan errores de hidratación.
 */
export function stripLocale(pathname: string): string {
  for (const l of SUPPORTED_LOCALES) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname || "/";
}
