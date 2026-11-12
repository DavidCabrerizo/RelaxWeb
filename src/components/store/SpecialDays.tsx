"use client";

import { useEffect, useState } from "react";
import type { SpecialDay } from "@/lib/content/types";
import { formatTime, upcomingSpecialDays } from "@/lib/site/hours";

type Labels = { title: string; closed: string };

/** Próximos cierres u horarios excepcionales (se calcula en el navegador: la fecha de hoy cambia). */
export function SpecialDays({ special, timezone, locale, labels }: { special: SpecialDay[]; timezone: string; locale: string; labels: Labels }) {
  const [list, setList] = useState<SpecialDay[]>([]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depende de la fecha actual, solo disponible en el navegador
    setList(upcomingSpecialDays(special, timezone));
  }, [special, timezone]);
  if (!list.length) return null;

  const fmt = new Intl.DateTimeFormat(locale === "fr" ? "fr-CH" : "en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  return (
    <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-100 p-4 text-ink">
      <p className="text-xs font-bold uppercase tracking-wider">{labels.title}</p>
      <ul className="mt-2 space-y-1 text-sm">
        {list.map((d) => (
          <li key={d.date} className="flex flex-wrap justify-between gap-2">
            <span className="first-letter:uppercase">{fmt.format(new Date(`${d.date}T12:00:00Z`))}</span>
            <span className="font-semibold">
              {d.closed || !d.open || !d.close ? labels.closed : `${formatTime(d.open, locale)} – ${formatTime(d.close, locale)}`}
              {d.note && <span className="font-normal"> · {d.note}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
