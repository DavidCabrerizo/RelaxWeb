/**
 * Formulario de contacto, configuración de la tienda y horarios excepcionales.
 * Ejecutar con: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseContact } from "../src/lib/contact/validate";
import { parseSettings, httpsUrlOn, GOOGLE_HOSTS } from "../src/lib/admin/settings-validate";
import { openStatus } from "../src/lib/site/hours";

const NOW = 1_800_000_000_000;
const contact = (o: Record<string, string>) => {
  const f = new FormData();
  const base = { name: "Jean Dupont", email: "jean@example.ch", message: "Bonjour, avez-vous des résistances ?", consent: "on", t: String(NOW - 10_000) };
  for (const [k, v] of Object.entries({ ...base, ...o })) f.set(k, v);
  return f;
};

test("contacto válido", () => {
  const r = parseContact(contact({}), NOW);
  assert.equal(r.kind, "ok");
});

test("contacto: honeypot y envío demasiado rápido se tratan como bot", () => {
  assert.equal(parseContact(contact({ website: "http://spam" }), NOW).kind, "bot");
  assert.equal(parseContact(contact({ t: String(NOW - 500) }), NOW).kind, "bot");
  assert.equal(parseContact(contact({ t: "abc" }), NOW).kind, "bot");
});

test("contacto: errores de campos y consentimiento", () => {
  const r = parseContact(contact({ name: "J", email: "no-email", message: "corto", consent: "" }), NOW);
  assert.equal(r.kind, "invalid");
  if (r.kind === "invalid") assert.deepEqual(Object.keys(r.errors).sort(), ["consent", "email", "message", "name"]);
});

test("contacto: sin saltos de línea en nombre ni email (inyección de cabeceras)", () => {
  const r = parseContact(contact({ name: "Jean\r\nBcc: victim@x.com" }), NOW);
  assert.equal(r.kind, "ok");
  if (r.kind === "ok") assert.equal(r.data.name.includes("\n"), false);
  const e = parseContact(contact({ email: "a@b.ch\nBcc: x@y.z" }), NOW);
  assert.equal(e.kind, "invalid");
});

const settings = (o: Record<string, string | string[]>) => {
  const f = new FormData();
  const base: Record<string, string> = { business_name: "Relax Sélection", address_city: "Genève", latitude: "46,1967818", longitude: "6.1464892" };
  for (let d = 1; d <= 7; d++) {
    if (d === 7) base[`closed_${d}`] = "on";
    else Object.assign(base, { [`open_${d}`]: "10:00", [`close_${d}`]: "19:00" });
  }
  for (const [k, v] of Object.entries({ ...base, ...o })) {
    if (Array.isArray(v)) v.forEach((x) => f.append(k, x));
    else f.set(k, v);
  }
  return f;
};

test("configuración válida: coordenadas con coma, domingo cerrado, francés siempre activo", () => {
  const { values, errors } = parseSettings(settings({ locale_en: "on" }));
  assert.deepEqual(errors, {});
  assert.equal(values.latitude, 46.196782);
  assert.equal((values.opening_hours as unknown[]).length, 6);
  assert.deepEqual(values.enabled_locales, ["fr", "en"]);
  assert.deepEqual(parseSettings(settings({})).values.enabled_locales, ["fr"]);
});

test("configuración: horarios y enlaces no válidos", () => {
  const { errors } = parseSettings(
    settings({
      open_1: "19:00",
      close_1: "10:00",
      phone: "llámame",
      google_maps_url: "javascript:alert(1)",
      social_instagram: "https://evil.example/instagram",
      latitude: "200",
    }),
  );
  assert.ok(errors.open_1 && errors.phone && errors.google_maps_url && errors.social_instagram && errors.latitude);
});

test("enlaces: solo https y dominios permitidos", () => {
  assert.ok(httpsUrlOn("https://maps.app.goo.gl/aXxZpkXfjxKGr4JWA", GOOGLE_HOSTS));
  assert.equal(httpsUrlOn("http://maps.app.goo.gl/x", GOOGLE_HOSTS), false);
  assert.equal(httpsUrlOn("https://maps.app.goo.gl.evil.com/x", GOOGLE_HOSTS), false);
});

test("días excepcionales: fechas válidas, sin duplicados, horario coherente", () => {
  const ok = parseSettings(settings({ special_date: ["2026-12-25", "2026-12-24"], special_mode: ["closed", "hours"], special_open: ["", "10:00"], special_close: ["", "16:00"], special_note: ["Noël", "Veille"] }));
  assert.deepEqual(ok.errors, {});
  assert.deepEqual((ok.values.special_hours as { date: string }[]).map((d) => d.date), ["2026-12-24", "2026-12-25"]);
  assert.ok(parseSettings(settings({ special_date: ["2026-02-30"], special_mode: ["closed"] })).errors.special);
  assert.ok(parseSettings(settings({ special_date: ["2026-12-25", "2026-12-25"], special_mode: ["closed", "closed"] })).errors.special);
});

test("«Ouvert / Fermé» respeta los cierres excepcionales", () => {
  const slots = [{ day: 4, open: "10:00", close: "19:00" }]; // jueves
  const thursdayNoon = new Date("2026-12-24T11:00:00Z"); // jueves 24/12, 12:00 en Zúrich
  assert.equal(openStatus(slots, "Europe/Zurich", thursdayNoon).open, true);
  const closed = openStatus(slots, "Europe/Zurich", thursdayNoon, [{ date: "2026-12-24", closed: true, note: "Veille de Noël" }]);
  assert.equal(closed.open, false);
  const shortDay = openStatus(slots, "Europe/Zurich", thursdayNoon, [{ date: "2026-12-24", closed: false, open: "09:00", close: "11:30" }]);
  assert.equal(shortDay.open, false);
});
