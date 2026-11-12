"use client";

import { useEffect, useState } from "react";
import type { OpeningSlot, SpecialDay } from "@/lib/content/types";
import { formatTime, openStatus } from "@/lib/site/hours";

type Props = {
  slots: OpeningSlot[];
  special?: SpecialDay[];
  timezone: string;
  locale: string;
  labels: { openNow: string; closedNow: string; closesAt: string };
};

/**
 * Indicador «Ouvert / Fermé» en tiempo real (zona Europe/Zurich).
 * Se calcula en el navegador tras montar: la página puede ser estática sin mostrar un estado caducado.
 */
export function OpenNowBadge({ slots, special = [], timezone, locale, labels }: Props) {
  const [status, setStatus] = useState<ReturnType<typeof openStatus> | null>(null);

  useEffect(() => {
    const tick = () => setStatus(openStatus(slots, timezone, new Date(), special));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [slots, special, timezone]);

  if (!status) return <span className="inline-block h-7" aria-hidden="true" />;

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
        status.open ? "bg-lime text-ink" : "bg-ink-3 text-paper/80"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${status.open ? "animate-pulse bg-ink" : "bg-paper/50"}`}
      />
      {status.open
        ? `${labels.openNow} · ${labels.closesAt.replace("{time}", formatTime(status.closesAt, locale))}`
        : labels.closedNow}
      {status.note && <span className="font-semibold normal-case tracking-normal opacity-80">· {status.note}</span>}
    </span>
  );
}
