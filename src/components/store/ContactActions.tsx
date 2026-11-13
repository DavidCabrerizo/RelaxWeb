import type { SiteSettings } from "@/lib/content/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** URL de indicaciones de Google Maps: coordenadas si existen; si no, la dirección. */
export function directionsUrl(s: SiteSettings): string | null {
  if (s.latitude != null && s.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`;
  }
  if (s.street) {
    const q = [s.businessName, s.street, s.postalCode, s.city, s.country].filter(Boolean).join(", ");
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
  }
  return null;
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
const waHref = (phone: string) => `https://wa.me/${phone.replace(/[^\d]/g, "")}`;

/**
 * Botones «Itinéraire» y «Appeler». Si falta el dato, el botón se muestra desactivado
 * (no se inventan direcciones ni teléfonos).
 */
export function ContactActions({ settings, t, className = "" }: { settings: SiteSettings; t: Dictionary; className?: string }) {
  const dir = directionsUrl(settings);
  const btn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold uppercase tracking-wider transition";
  const off = `${btn} cursor-not-allowed border border-line-dark text-paper/40`;

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {dir ? (
        <a href={dir} target="_blank" rel="noopener noreferrer" className={`${btn} bg-lime text-ink hover:bg-lime-soft hover:shadow-glow`}>
          <PinIcon /> {t.cta.directions}
        </a>
      ) : (
        <span aria-disabled="true" title={t.contact.pending} className={off}>
          <PinIcon /> {t.cta.directions}
        </span>
      )}
      {settings.phone ? (
        <a href={telHref(settings.phone)} className={`${btn} border border-lime text-lime hover:bg-lime hover:text-ink`}>
          <PhoneIcon /> {t.cta.call}
        </a>
      ) : (
        <span aria-disabled="true" title={t.contact.pending} className={off}>
          <PhoneIcon /> {t.cta.call}
        </span>
      )}
      {settings.whatsapp && (
        <a href={waHref(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className={`${btn} border border-line-dark text-paper hover:border-lime hover:text-lime`}>
          {t.cta.whatsapp}
        </a>
      )}
    </div>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}
