import type { MetadataRoute } from "next";

/** Manifiesto web: nombre e icono al añadir la web a la pantalla de inicio del móvil. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Relax Sélection — Vape, CBD, e-liquides · Genève",
    short_name: "Relax Sélection",
    description: "Boutique multimarque à Genève : vape, CBD, e-liquides et accessoires.",
    lang: "fr-CH",
    start_url: "/",
    display: "browser",
    background_color: "#111111",
    theme_color: "#111111",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
