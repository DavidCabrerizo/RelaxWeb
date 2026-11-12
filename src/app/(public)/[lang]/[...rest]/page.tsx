import { notFound } from "next/navigation";

/**
 * Cualquier URL que no corresponde a ninguna página (/no-existe, /en/x/y…) termina aquí y
 * muestra el 404 de [lang]/not-found.tsx dentro del layout del idioma: con cabecera, pie,
 * <html lang> y estado HTTP 404. Sin esta ruta, Next pintaría su 404 genérico.
 */
export default function CatchAll(): never {
  notFound();
}
