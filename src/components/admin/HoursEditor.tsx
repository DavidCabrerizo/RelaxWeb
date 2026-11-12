"use client";

import { useState } from "react";
import { useFieldError } from "./Form";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const cls = "w-28 rounded-lg border border-line-dark bg-ink px-2.5 py-2 text-sm outline-none focus:border-lime disabled:opacity-30";

/** Horario semanal: un tramo por día, o «Cerrado». */
export function HoursEditor({ initial }: { initial: { day: number; open: string; close: string }[] }) {
  return (
    <ul className="divide-y divide-line-dark rounded-xl border border-line-dark bg-ink">
      {DAYS.map((label, i) => (
        <DayRow key={label} day={i + 1} label={label} slot={initial.find((s) => s.day === i + 1)} />
      ))}
    </ul>
  );
}

function DayRow({ day, label, slot }: { day: number; label: string; slot?: { open: string; close: string } }) {
  const [closed, setClosed] = useState(!slot);
  const error = useFieldError(`open_${day}`);
  return (
    <li className="px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-24 text-sm font-semibold">{label}</span>
        <input type="time" name={`open_${day}`} defaultValue={slot?.open ?? "10:00"} disabled={closed} aria-label={`${label}: apertura`} className={cls} />
        <span className="text-muted-dark">–</span>
        <input type="time" name={`close_${day}`} defaultValue={slot?.close ?? "19:00"} disabled={closed} aria-label={`${label}: cierre`} className={cls} />
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input type="checkbox" name={`closed_${day}`} checked={closed} onChange={(e) => setClosed(e.target.checked)} className="h-4 w-4 accent-[var(--color-lime)]" />
          Cerrado
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </li>
  );
}
