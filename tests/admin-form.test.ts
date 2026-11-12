/**
 * Pruebas de la lógica de formularios del panel (sin Supabase).
 * Ejecutar:  node --conditions=react-server --import tsx --test tests/admin-form.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, SLUG_RE, str, int, uuid, translations, dbErrorMessage } from "../src/lib/admin/form";
import { validateTranslations, splitLocales } from "../src/lib/admin/i18n";

test("slugify produce slugs válidos para el dominio SQL", () => {
  assert.equal(slugify("Fleurs CBD Indoor été"), "fleurs-cbd-indoor-ete");
  assert.equal(slugify("  E-liquide « Fraise & Menthe » 10ml "), "e-liquide-fraise-et-menthe-10ml");
  assert.equal(slugify("Ça--va???"), "ca-va");
  assert.equal(slugify("---"), "");
  for (const s of ["Œuvre d'art", "Accessoires / Résistances", "x".repeat(200)]) {
    const out = slugify(s);
    assert.ok(out === "" || SLUG_RE.test(out), `inválido: ${out}`);
    assert.ok(out.length <= 120);
  }
});

test("str recorta, normaliza saltos de línea y limita longitud", () => {
  const f = new FormData();
  f.set("a", "  hola\r\nmundo  ");
  f.set("b", "   ");
  f.set("c", "x".repeat(50));
  assert.equal(str(f, "a"), "hola\nmundo");
  assert.equal(str(f, "b"), null);
  assert.equal(str(f, "c", 10)?.length, 10);
  assert.equal(str(f, "missing"), null);
});

test("int acota y usa el valor por defecto", () => {
  const f = new FormData();
  f.set("n", "999999999");
  f.set("bad", "abc");
  assert.equal(int(f, "n"), 100000);
  assert.equal(int(f, "bad", 7), 7);
});

test("uuid solo acepta UUIDs (evita valores arbitrarios en filtros)", () => {
  assert.equal(uuid("6F9619FF-8B86-D011-B42D-00C04FC964FF"), "6f9619ff-8b86-d011-b42d-00c04fc964ff");
  assert.equal(uuid("1 or 1=1"), null);
  assert.equal(uuid(""), null);
});

test("reglas de traducción: FR obligatorio, EN opcional pero coherente", () => {
  const f = new FormData();
  f.set("name_fr", "");
  f.set("description_en", "Some text");
  const tr = translations(f, { name: 80, description: 2000 });
  const errors: Record<string, string> = {};
  validateTranslations(tr, "name", errors);
  assert.ok(errors.name_fr, "falta el error de nombre FR");
  assert.ok(errors.name_en, "si se rellena EN, el nombre EN es obligatorio");

  const ok = new FormData();
  ok.set("name_fr", "Nom");
  const tr2 = translations(ok, { name: 80, description: 2000 });
  const e2: Record<string, string> = {};
  validateTranslations(tr2, "name", e2);
  assert.deepEqual(e2, {});
  assert.deepEqual(splitLocales(tr2, "name"), { filled: ["fr"], empty: ["en"] });
});

test("errores de base de datos traducidos sin filtrar detalles internos", () => {
  assert.match(dbErrorMessage({ code: "23505" }), /slug/);
  assert.match(dbErrorMessage({ code: "23503" }), /asociados/);
  const orig = console.error;
  console.error = () => {};
  assert.equal(dbErrorMessage({ code: "XX000", message: "secret internals" }).includes("secret"), false);
  console.error = orig;
});
