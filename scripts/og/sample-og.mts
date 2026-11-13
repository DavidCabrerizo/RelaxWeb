/**
 * Genera imágenes al compartir de ejemplo (productos y marcas ficticios) para revisar el diseño.
 * Uso: node --conditions=react-server --import tsx scripts/og/sample-og.mts <carpeta-salida>
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { logoOg, photoOg } from "../../src/lib/og/compose";

const out = process.argv[2] ?? "og-ejemplos";
mkdirSync(out, { recursive: true });
const svg = (w: number, h: number, body: string) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);

const packshot = await sharp(
  svg(
    800,
    1200,
    '<rect width="800" height="1200" fill="#f4f4f2"/><rect x="300" y="160" width="200" height="120" rx="20" fill="#333"/><rect x="250" y="260" width="300" height="760" rx="60" fill="#2b6cb0"/><rect x="290" y="420" width="220" height="260" rx="20" fill="#fff"/>',
  ),
)
  .webp()
  .toBuffer();
const landscape = await sharp(
  svg(
    1600,
    900,
    '<defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#734b2a"/><stop offset="1" stop-color="#1d1a17"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><circle cx="1100" cy="380" r="220" fill="#d9a441"/><rect x="200" y="500" width="700" height="260" rx="30" fill="#7ef424" opacity=".8"/>',
  ),
)
  .jpeg()
  .toBuffer();
const mark = (fill: string) =>
  `<rect x="60" y="70" width="160" height="160" rx="40" fill="${fill}"/><rect x="260" y="100" width="560" height="40" rx="20" fill="${fill}"/><rect x="260" y="170" width="380" height="40" rx="20" fill="${fill}"/>`;
const darkLogo = await sharp(svg(900, 300, mark("#1b2a49")))
  .png()
  .toBuffer();
const lightLogo = await sharp(svg(900, 300, mark("#ffffff")))
  .png()
  .toBuffer();
const opaqueLogo = await sharp(
  svg(
    700,
    700,
    '<rect width="700" height="700" fill="#c0392b"/><circle cx="350" cy="350" r="220" fill="#fff"/><circle cx="350" cy="350" r="120" fill="#c0392b"/>',
  ),
)
  .jpeg()
  .toBuffer();

const jobs: [string, Promise<Buffer>][] = [
  ["producto-vertical.jpg", photoOg(packshot)],
  ["producto-horizontal.jpg", photoOg(landscape)],
  ["marca-logo-oscuro.jpg", logoOg(darkLogo)],
  ["marca-logo-claro.jpg", logoOg(lightLogo)],
  ["marca-logo-opaco.jpg", logoOg(opaqueLogo)],
];
for (const [name, p] of jobs) writeFileSync(`${out}/${name}`, await p);
console.log("Ejemplos en", out);
