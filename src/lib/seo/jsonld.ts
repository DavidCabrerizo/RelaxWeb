/**
 * Datos estructurados Schema.org (JSON-LD).
 * Módulo puro (sin dependencias de servidor) para poder validarlo con tests.
 */
import type { SiteSettings } from "@/lib/content/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Localidades atendidas (coherentes con el texto «Facilement accessible depuis…»). */
export const AREA_SERVED = ["Genève", "Carouge", "Lancy", "Onex", "Vernier", "Meyrin", "Plan-les-Ouates", "Thônex", "Chêne-Bourg"];

/** Tienda local: nombre, dirección, coordenadas, teléfono, horario y cierres excepcionales. */
export function storeJsonLd(s: SiteSettings, opts: { baseUrl: string; url: string; locale: string; image?: string; description: string }) {
  const sameAs = [s.googleBusinessUrl, s.googleMapsUrl, ...Object.values(s.social)].filter(
    (v, i, a): v is string => Boolean(v) && a.indexOf(v) === i,
  );

  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${opts.baseUrl}/#store`,
    name: s.businessName,
    description: opts.description,
    url: opts.url,
    inLanguage: opts.locale === "fr" ? "fr-CH" : "en",
    ...(opts.image ? { image: opts.image, logo: opts.image } : {}),
    ...(s.phone ? { telephone: s.phone.replace(/\s+/g, " ") } : {}),
    ...(s.email ? { email: s.email } : {}),
    address: {
      "@type": "PostalAddress",
      ...(s.street ? { streetAddress: s.street } : {}),
      ...(s.postalCode ? { postalCode: s.postalCode } : {}),
      addressLocality: s.city,
      addressRegion: "GE",
      addressCountry: s.country,
    },
    ...(s.latitude != null && s.longitude != null
      ? { geo: { "@type": "GeoCoordinates", latitude: s.latitude, longitude: s.longitude } }
      : {}),
    ...(s.googleMapsUrl ? { hasMap: s.googleMapsUrl } : {}),
    areaServed: AREA_SERVED.map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: s.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${DAYS[h.day - 1]}`,
      opens: h.open,
      closes: h.close,
    })),
    // Cierre excepcional = opens/closes 00:00 (convención de Google para «cerrado todo el día»)
    ...(s.specialHours.length
      ? {
          specialOpeningHoursSpecification: s.specialHours.map((d) => ({
            "@type": "OpeningHoursSpecification",
            validFrom: d.date,
            validThrough: d.date,
            opens: d.closed || !d.open ? "00:00" : d.open,
            closes: d.closed || !d.close ? "00:00" : d.close,
          })),
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.url ? { item: it.url } : {}),
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/**
 * Serializa para <script type="application/ld+json"> sin permitir cerrar la etiqueta:
 * se escapan <, > y & (un texto del panel con "</script>" no puede inyectar HTML).
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
