import "server-only";
import type { Locale } from "./config";
import type fr from "@/i18n/dictionaries/fr.json";

/** El francés es el diccionario de referencia: el resto debe tener la misma forma. */
export type Dictionary = typeof fr;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  fr: () => import("@/i18n/dictionaries/fr.json").then((m) => m.default),
  en: () => import("@/i18n/dictionaries/en.json").then((m) => m.default),
};

export const getDictionary = (locale: Locale): Promise<Dictionary> => dictionaries[locale]();
