/**
 * Bloques de contenido editables desde /admin/contenidos (tabla page_content).
 * Cada campo tiene un texto por defecto en los diccionarios (src/i18n/dictionaries):
 * si el editor deja un campo vacío, la web muestra el texto por defecto.
 */
import type { Dictionary } from "@/lib/i18n/dictionaries";

export type BlockField = { name: string; label: string; multiline?: boolean; max: number };
export type BlockDef = { key: string; title: string; fields: BlockField[]; defaults: (t: Dictionary) => Record<string, string> };

export const CONTENT_BLOCKS: BlockDef[] = [
  {
    key: "home.hero",
    title: "Inicio · Cabecera",
    fields: [{ name: "text", label: "Texto bajo el logotipo", multiline: true, max: 300 }],
    defaults: (t) => ({ text: t.home.heroText }),
  },
  {
    key: "home.featured",
    title: "Inicio · Productos destacados",
    fields: [
      { name: "title", label: "Título", max: 80 },
      { name: "text", label: "Texto", multiline: true, max: 300 },
    ],
    defaults: (t) => ({ title: t.home.featuredTitle, text: t.home.featuredText }),
  },
  {
    key: "home.visit",
    title: "Inicio · Venid a vernos",
    fields: [
      { name: "title", label: "Título", max: 80 },
      { name: "text", label: "Texto", multiline: true, max: 400 },
    ],
    defaults: (t) => ({ title: t.home.visitTitle, text: t.home.visitText }),
  },
  {
    key: "about",
    title: "À propos",
    fields: [
      { name: "lead", label: "Introducción", multiline: true, max: 400 },
      { name: "p1", label: "Párrafo 1", multiline: true, max: 1500 },
      { name: "p2", label: "Párrafo 2", multiline: true, max: 1500 },
    ],
    defaults: (t) => ({ lead: t.about.lead, p1: t.about.p1, p2: t.about.p2 }),
  },
  {
    key: "footer",
    title: "Pie de página",
    fields: [{ name: "tagline", label: "Lema", max: 120 }],
    defaults: (t) => ({ tagline: t.footer.tagline }),
  },
];

/** Imágenes de contenido (no dependen del idioma; se guardan en page_content con locale "fr"). */
export const CONTENT_IMAGES = [
  { key: "images.home_hero", label: "Inicio · Imagen de fondo de la cabecera", hint: "Foto de la tienda, horizontal. Se oscurece para que el logo se lea bien." },
  { key: "images.about", label: "À propos · Foto de la tienda", hint: "Interior o fachada, horizontal (4:3)." },
] as const;
export type ContentImageKey = (typeof CONTENT_IMAGES)[number]["key"];

export const SOCIAL_NETWORKS = ["instagram", "facebook", "tiktok"] as const;
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];
