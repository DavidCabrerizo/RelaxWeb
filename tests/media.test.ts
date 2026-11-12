/**
 * Validación de imágenes en el servidor: tipo real por firma y rutas permitidas.
 * Ejecutar con: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { detectImageKind, isBrandImagePath, isProductImagePath } from "../src/lib/media/signature";

const bytes = (...parts: (number[] | string)[]) =>
  new Uint8Array(parts.flatMap((p) => (typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p)));

test("detecta JPEG, PNG, WebP y AVIF por sus primeros bytes", () => {
  assert.equal(detectImageKind(bytes([0xff, 0xd8, 0xff, 0xe0], "JFIF")), "jpeg");
  assert.equal(detectImageKind(bytes([0x89], "PNG", [0x0d, 0x0a, 0x1a, 0x0a])), "png");
  assert.equal(detectImageKind(bytes("RIFF", [0, 0, 0, 0], "WEBPVP8 ")), "webp");
  assert.equal(detectImageKind(bytes([0, 0, 0, 0x1c], "ftypavif")), "avif");
});

test("rechaza archivos que no son imágenes aunque se llamen .jpg", () => {
  assert.equal(detectImageKind(bytes("MZ", [0x90, 0x00])), null); // ejecutable de Windows
  assert.equal(detectImageKind(bytes("%PDF-1.7")), null);
  assert.equal(detectImageKind(bytes("<svg xmlns=")), null); // SVG excluido (puede llevar scripts)
  assert.equal(detectImageKind(bytes("<?php echo")), null);
  assert.equal(detectImageKind(bytes("GIF89a")), null);
  assert.equal(detectImageKind(new Uint8Array()), null);
  assert.equal(detectImageKind(bytes([0, 0, 0, 0x1c], "ftypmp42")), null); // vídeo MP4
});

const P = "6f9619ff-8b86-4011-b42d-00c04fc964ff";
const OTHER = "11111111-2222-4333-8444-555555555555";
const FILE = "0f8fad5b-d9cb-469f-a165-70867728950e";

test("solo se registran rutas de la carpeta del propio producto", () => {
  assert.ok(isProductImagePath(`products/${P}/${FILE}.webp`, P));
  assert.ok(isProductImagePath(`products/${P}/${FILE}.jpg`, P));
  assert.equal(isProductImagePath(`products/${OTHER}/${FILE}.webp`, P), false); // otro producto
  assert.equal(isProductImagePath(`products/${P}/../${OTHER}/${FILE}.webp`, P), false); // recorrido de rutas
  assert.equal(isProductImagePath(`products/${P}/${FILE}.svg`, P), false);
  assert.equal(isProductImagePath(`products/${P}/foto.webp`, P), false);
  assert.equal(isProductImagePath(`brands/${P}/logo-${FILE}.webp`, P), false);
});

test("rutas de logo y portada de marca", () => {
  assert.ok(isBrandImagePath(`brands/${P}/logo-${FILE}.png`, P, "logo"));
  assert.ok(isBrandImagePath(`brands/${P}/cover-${FILE}.webp`, P, "cover"));
  assert.equal(isBrandImagePath(`brands/${P}/cover-${FILE}.webp`, P, "logo"), false);
  assert.equal(isBrandImagePath(`brands/${OTHER}/logo-${FILE}.png`, P, "logo"), false);
});
