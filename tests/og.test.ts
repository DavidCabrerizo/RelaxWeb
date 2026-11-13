/**
 * Imágenes al compartir (Open Graph) de productos y marcas. Ejecutar con: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { logoOg, photoOg } from "../src/lib/og/compose";
import { fetchStoredImage } from "../src/lib/og/fetch-image";
import { slugFromFile } from "../src/lib/og/respond";
import { ogVersion } from "../src/lib/seo/metadata";

const svg = (w: number, h: number, body: string) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);

async function check(buf: Buffer) {
  const m = await sharp(buf).metadata();
  assert.equal(m.format, "jpeg");
  assert.equal(m.width, 1200);
  assert.equal(m.height, 630);
  assert.ok(buf.length < 300 * 1024, `pesa ${buf.length} B: WhatsApp no muestra vistas previas grandes`);
}
/** Color medio de una zona (para comprobar el fondo elegido). */
async function colorAt(buf: Buffer, left: number, top: number) {
  const { data } = await sharp(buf).extract({ left, top, width: 8, height: 8 }).raw().toBuffer({ resolveWithObject: true });
  return [0, 1, 2].map((c) => Math.round(data.filter((_, i) => i % 3 === c).reduce((a, b) => a + b, 0) / 64));
}

test("Producto con fondo liso (foto de catálogo, WebP vertical): el fondo continúa su color", async () => {
  const photo = await sharp(svg(800, 1200, '<rect width="800" height="1200" fill="#f3f3f1"/><rect x="280" y="240" width="240" height="600" rx="60" fill="#5b3fa8"/>'))
    .webp()
    .toBuffer();
  const out = await photoOg(photo);
  await check(out);
  const [r, g, b] = await colorAt(out, 40, 40);
  assert.ok(Math.abs(r - 0xf3) < 8 && Math.abs(g - 0xf3) < 8 && Math.abs(b - 0xf1) < 8, `esquina ${r},${g},${b}`);
});

test("Producto con foto real (horizontal): tarjeta sobre la misma foto difuminada", async () => {
  const photo = await sharp(svg(1600, 900, '<defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#c06030"/><stop offset="1" stop-color="#203040"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/>'))
    .jpeg()
    .toBuffer();
  await check(await photoOg(photo));
});

test("Marca: logo oscuro → fondo blanco; logo claro → fondo negro de la marca", async () => {
  const dark = await sharp(svg(900, 300, '<rect x="50" y="80" width="800" height="140" rx="30" fill="#1b2a49"/>')).png().toBuffer();
  const light = await sharp(svg(900, 300, '<rect x="50" y="80" width="800" height="140" rx="30" fill="#ffffff"/>')).png().toBuffer();
  const a = await logoOg(dark);
  const b = await logoOg(light);
  await check(a);
  await check(b);
  assert.deepEqual(await colorAt(a, 20, 20), [255, 255, 255]);
  assert.deepEqual(await colorAt(b, 20, 20), [17, 17, 17]);
});

test("Marca con logo opaco: el fondo continúa el color de su esquina", async () => {
  const logo = await sharp(svg(600, 600, '<rect width="600" height="600" fill="#c0392b"/><circle cx="300" cy="300" r="180" fill="#fff"/>')).jpeg({ quality: 95 }).toBuffer();
  const out = await logoOg(logo);
  await check(out);
  const [r, g, b] = await colorAt(out, 20, 20);
  assert.ok(Math.abs(r - 0xc0) < 10 && Math.abs(g - 0x39) < 10 && Math.abs(b - 0x2b) < 10, `esquina ${r},${g},${b}`);
});

test("Una imagen dañada lanza error (la ruta responde con el logo de la tienda)", async () => {
  await assert.rejects(photoOg(Buffer.from("no es una imagen")));
});

test("Nombre de archivo: solo <slug>.jpg", () => {
  assert.equal(slugFromFile("kit-pod-compact.jpg"), "kit-pod-compact");
  for (const bad of ["kit.png", "../x.jpg", "Kit.jpg", "kit--pod.jpg", ".jpg", "kit.jpg.exe"]) assert.equal(slugFromFile(bad), null, bad);
});

test("Versión de la URL: cambia si cambia la foto o la fecha, estable si no", () => {
  const v = ogVersion("2026-11-12T10:00:00Z", "https://x.supabase.co/a.webp");
  assert.equal(v, ogVersion("2026-11-12T10:00:00Z", "https://x.supabase.co/a.webp"));
  assert.notEqual(v, ogVersion("2026-11-12T10:00:00Z", "https://x.supabase.co/b.webp"));
  assert.notEqual(v, ogVersion("2026-11-13T10:00:00Z", "https://x.supabase.co/a.webp"));
});

test("Solo se descargan imágenes de Supabase o de la propia web (sin SSRF)", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abcd.supabase.co";
  const base = "https://relax-selection.ch/og/produit/x.jpg";
  for (const url of ["https://evil.example.com/a.png", "http://169.254.169.254/latest/meta-data", "file:///etc/passwd", "https://abcd.supabase.co.evil.com/a.png"]) {
    assert.equal(await fetchStoredImage(url, base), null, url);
  }
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
});
