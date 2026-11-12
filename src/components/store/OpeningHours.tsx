import type { OpeningSlot } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatTime, hoursByDay } from "@/lib/site/hours";

type Props = {
  locale: Locale;
  t: Dictionary;
  slots: OpeningSlot[];
  compact?: boolean;
  tone?: "dark" | "light";
  className?: string;
};

/** Tabla de horarios (renderizada en servidor, indexable). */
export function OpeningHours({ locale, t, slots, compact, tone = "dark", className = "" }: Props) {
  const closedCls = tone === "dark" ? "text-muted-dark" : "text-muted";
  const lineCls = tone === "dark" ? "divide-line-dark" : "divide-line";

  return (
    <dl className={`divide-y ${lineCls} ${compact ? "text-sm" : "text-base"} ${className}`}>
      {hoursByDay(slots).map((daySlots, i) => (
        <div key={i} className={`flex justify-between gap-4 ${compact ? "py-1.5" : "py-3"}`}>
          <dt className="font-semibold">{t.hours.days[i]}</dt>
          <dd className={daySlots.length ? "" : closedCls}>
            {daySlots.length
              ? daySlots.map((s) => `${formatTime(s.open, locale)} – ${formatTime(s.close, locale)}`).join(", ")
              : t.hours.closed}
          </dd>
        </div>
      ))}
    </dl>
  );
}
