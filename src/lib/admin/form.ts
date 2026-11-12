import "server-only";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/config";

/** Estado que devuelven las Server Actions del panel a sus formularios. */
export type ActionState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

/** Idiomas editables en el panel (aunque uno esté desactivado en la web, se puede preparar). */
export const ADMIN_LOCALES: readonly Locale[] = SUPPORTED_LOCALES;

export function str(form: FormData, name: string, max = 5000): string | null {
  const v = form.get(name);
  if (typeof v !== "string") return null;
  const t = v.replace(/\r\n/g, "\n").trim();
  return t ? t.slice(0, max) : null;
}

export const bool = (form: FormData, name: string) => form.get(name) === "on" || form.get(name) === "true";

export function int(form: FormData, name: string, fallback = 0, min = -100000, max = 100000): number {
  const n = Number.parseInt(String(form.get(name) ?? ""), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/** UUID válido o null (evita inyectar valores arbitrarios en filtros .eq()). */
export function uuid(form: FormData | string | null, name?: string): string | null {
  const v = typeof form === "string" || form === null ? form : String(form.get(name!) ?? "");
  return v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v) ? v.toLowerCase() : null;
}

/** "Fleurs CBD Indoor été" → "fleurs-cbd-indoor-ete" (formato exigido por el dominio SQL `slug`). */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, "-et-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Campos traducibles: inputs con nombre `${campo}_${idioma}` (p. ej. name_fr, name_en). */
export function translations<F extends string>(form: FormData, fields: Record<F, number>) {
  const out = {} as Record<Locale, Record<F, string | null>>;
  for (const l of ADMIN_LOCALES) {
    out[l] = {} as Record<F, string | null>;
    for (const f of Object.keys(fields) as F[]) out[l][f] = str(form, `${f}_${l}`, fields[f]);
  }
  return out;
}

/** Errores de Postgres → mensajes comprensibles. */
export function dbErrorMessage(error: { code?: string; message?: string; details?: string } | null): string {
  if (!error) return "Error desconocido.";
  switch (error.code) {
    case "23505":
      return "Ya existe un elemento con ese slug (URL). Elige otro.";
    case "23503":
      return "No se puede eliminar: hay elementos asociados.";
    case "23514":
      return "Algún campo no cumple el formato o la longitud permitida.";
    case "42501":
      return "No tienes permiso para realizar esta acción.";
    default:
      // Se registra el detalle en el servidor, sin datos sensibles, y no se muestra al usuario
      console.error("[admin] error de base de datos", error.code, error.message);
      return "No se ha podido guardar. Inténtalo de nuevo.";
  }
}
