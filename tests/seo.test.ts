/**
 * Datos estructurados (JSON-LD). Ejecutar con: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { breadcrumbJsonLd, faqJsonLd, serializeJsonLd, storeJsonLd } from "../src/lib/seo/jsonld";
import type { SiteSettings } from "../src/lib/content/types";

const settings: SiteSettings = {
  businessName: "Relax Sélection",
  street: "Boulevard des Philosophes 23",
  postalCode: "1205",
  city: "Genève",
  country: "CH",
  latitude: 46.196782,
  longitude: 6.146489,
  phone: "+41 78 616 20 82",
  whatsapp: null,
  email: null,
  googleMapsUrl: "https://maps.app.goo.gl/aXxZpkXfjxKGr4JWA",
  googleBusinessUrl: "https://maps.app.goo.gl/aXxZpkXfjxKGr4JWA",
  openingHours: [1, 2, 3, 4, 5, 6].map((day) => ({ day, open: "10:00", close: "19:00" })),
  specialHours: [{ date: "2026-12-25", closed: true, note: "Noël" }],
  social: { instagram: "https://www.instagram.com/relax" },
  timezone: "Europe/Zurich",
};

test("Store: dirección, coordenadas, horario y cierres excepcionales", () => {
  const ld = storeJsonLd(settings, { baseUrl: "https://ex.ch", url: "https://ex.ch/", locale: "fr", description: "Boutique" });
  assert.equal(ld["@type"], "Store");
  assert.equal(ld.address.streetAddress, "Boulevard des Philosophes 23");
  assert.equal(ld.address.addressCountry, "CH");
  assert.deepEqual(ld.geo, { "@type": "GeoCoordinates", latitude: 46.196782, longitude: 6.146489 });
  assert.equal(ld.openingHoursSpecification.length, 6);
  assert.equal(ld.openingHoursSpecification[0].dayOfWeek, "https://schema.org/Monday");
  assert.equal(ld.openingHoursSpecification.some((h) => h.dayOfWeek.endsWith("Sunday")), false);
  assert.deepEqual(ld.specialOpeningHoursSpecification?.[0], {
    "@type": "OpeningHoursSpecification",
    validFrom: "2026-12-25",
    validThrough: "2026-12-25",
    opens: "00:00",
    closes: "00:00",
  });
  // sameAs sin duplicados (ficha de Maps y GBP son el mismo enlace)
  assert.deepEqual(ld.sameAs, ["https://maps.app.goo.gl/aXxZpkXfjxKGr4JWA", "https://www.instagram.com/relax"]);
});

test("Store sin coordenadas ni teléfono: no se inventan campos", () => {
  const ld = storeJsonLd({ ...settings, latitude: null, longitude: null, phone: null, specialHours: [] }, { baseUrl: "b", url: "u", locale: "en", description: "d" });
  assert.equal("geo" in ld, false);
  assert.equal("telephone" in ld, false);
  assert.equal("specialOpeningHoursSpecification" in ld, false);
});

test("BreadcrumbList y FAQPage", () => {
  const bc = breadcrumbJsonLd([{ name: "Accueil", url: "https://ex.ch/" }, { name: "Produit" }]);
  assert.equal(bc.itemListElement[1].position, 2);
  assert.equal("item" in bc.itemListElement[1], false);
  const faq = faqJsonLd([{ q: "Q ?", a: "R." }]);
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, "R.");
});

test("JSON-LD no permite cerrar la etiqueta <script> (texto malicioso del panel)", () => {
  const out = serializeJsonLd(faqJsonLd([{ q: "</script><script>alert(1)</script>", a: "a & b" }]));
  assert.equal(out.includes("</script>"), false);
  assert.equal(out.includes("<"), false);
  // Sigue siendo JSON válido con el texto original
  assert.equal(JSON.parse(out).mainEntity[0].name, "</script><script>alert(1)</script>");
});
