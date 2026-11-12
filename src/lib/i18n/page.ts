import "server-only";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";
import { getEnabledLocales } from "@/lib/site/defaults";

/** Valida el idioma de la ruta y carga su diccionario. 404 si el idioma no está activo. */
export async function pageContext(params: Promise<{ lang: string }>): Promise<{ lang: Locale; t: Dictionary }> {
  const { lang } = await params;
  if (!isLocale(lang) || !getEnabledLocales().includes(lang)) notFound();
  return { lang, t: await getDictionary(lang) };
}
