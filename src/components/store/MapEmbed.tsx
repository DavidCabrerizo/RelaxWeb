"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_COOKIE, CONSENT_EVENT, readCookie, writeCookie } from "@/lib/consent";

const subscribe = (cb: () => void) => {
  window.addEventListener(CONSENT_EVENT, cb);
  return () => window.removeEventListener(CONSENT_EVENT, cb);
};
const accepted = () => readCookie(CONSENT_COOKIE) === "accepted";

/**
 * Mapa de Google Maps incrustado SOLO con consentimiento (nLPD):
 * hasta entonces no se carga nada de Google; se muestra un botón que pide permiso.
 * No requiere clave de API.
 */
export function MapEmbed({
  lat,
  lng,
  query,
  locale,
  labels,
}: {
  lat: number | null;
  lng: number | null;
  query: string;
  locale: string;
  labels: { show: string; notice: string; title: string };
}) {
  const ok = useSyncExternalStore(subscribe, accepted, () => false);
  const q = lat != null && lng != null ? `${lat},${lng}` : encodeURIComponent(query);
  const src = `https://www.google.com/maps?q=${q}&z=16&hl=${locale}&output=embed`;

  if (ok) {
    return (
      <iframe
        title={labels.title}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[4/3] w-full rounded-xl border-0 sm:aspect-video"
        allowFullScreen
      />
    );
  }

  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-line-dark bg-ink p-6 text-center sm:aspect-video">
      <p className="max-w-sm text-sm text-muted-dark">{labels.notice}</p>
      <button
        type="button"
        onClick={() => {
          writeCookie(CONSENT_COOKIE, "accepted", 180);
          window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: "accepted" }));
        }}
        className="min-h-11 rounded-full border border-lime px-5 text-sm font-bold uppercase tracking-wider text-lime hover:bg-lime hover:text-ink"
      >
        {labels.show}
      </button>
    </div>
  );
}
