/**
 * Exporta el logotipo (componente <Logo>) como SVG independiente, con los colores fijos,
 * para usarlo fuera de la web: imágenes al compartir (OG), favicon, documentos.
 * Uso: npx tsx scripts/brand/export-logo.tsx
 * Salida: src/lib/og/logo-svg.ts (cadenas para las imágenes generadas en el servidor)
 *         public/brand/logo-sobre-oscuro.svg y logo-sobre-claro.svg
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { Logo } from "../../src/components/brand/Logo";

const COLORS: Record<string, string> = {
  "var(--color-paper)": "#ffffff",
  "var(--color-ink)": "#111111",
  "var(--color-lime)": "#7ef424",
  "var(--color-lime-ink)": "#3b7a12",
};
const solid = (svg: string) =>
  Object.entries(COLORS)
    .reduce((s, [k, v]) => s.split(k).join(v), svg)
    .replace(/ data-demo="[^"]*"/, "")
    .replace(/ role="img"/, "");

const dark = solid(renderToStaticMarkup(<Logo variant="dark" />));
const light = solid(renderToStaticMarkup(<Logo variant="light" />));
if (/var\(--/.test(dark + light)) throw new Error("Quedan variables CSS sin resolver en el logo");

mkdirSync("public/brand", { recursive: true });
writeFileSync("public/brand/logo-sobre-oscuro.svg", dark);
writeFileSync("public/brand/logo-sobre-claro.svg", light);
writeFileSync(
  "src/lib/og/logo-svg.ts",
  `// Generado por scripts/brand/export-logo.tsx. No editar a mano.\nexport const LOGO_ON_DARK = ${JSON.stringify(dark)};\nexport const LOGO_ON_LIGHT = ${JSON.stringify(light)};\n`,
);
console.log("Logo exportado:", dark.length, "y", light.length, "caracteres");
