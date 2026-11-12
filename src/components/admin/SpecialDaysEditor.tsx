"use client";

import { useRef, useState } from "react";
import { useFieldError } from "./Form";

type Row = { key: string; date: string; mode: "closed" | "hours"; open: string; close: string; note: string };
export type SpecialInput = { date: string; closed: boolean; open?: string; close?: string; note?: string };

const cls = "rounded-lg border border-line-dark bg-ink px-2.5 py-2 text-sm outline-none focus:border-lime";

/** Lista editable de cierres u horarios excepcionales (festivos, vacaciones, inventario…). */
export function SpecialDaysEditor({ initial }: { initial: SpecialInput[] }) {
  const error = useFieldError("special");
  // Claves deterministas (no aleatorias en el render: el servidor y el navegador deben coincidir)
  const nextKey = useRef(initial.length);
  const [rows, setRows] = useState<Row[]>(
    initial.map((d, i) => ({
      key: `row-${i}`,
      date: d.date,
      mode: d.closed ? "closed" : "hours",
      open: d.open ?? "10:00",
      close: d.close ?? "16:00",
      note: d.note ?? "",
    })),
  );
  const update = (key: string, patch: Partial<Row>) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  return (
    <div>
      {rows.length === 0 && <p className="text-sm text-muted-dark">Ningún día excepcional.</p>}
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.key} className="flex flex-wrap items-end gap-2 rounded-xl border border-line-dark bg-ink p-3">
            <label className="text-xs font-semibold">
              Fecha
              <input type="date" name="special_date" value={r.date} required onChange={(e) => update(r.key, { date: e.target.value })} className={`${cls} mt-1 block`} />
            </label>
            <label className="text-xs font-semibold">
              Tipo
              <select name="special_mode" value={r.mode} onChange={(e) => update(r.key, { mode: e.target.value as Row["mode"] })} className={`${cls} mt-1 block`}>
                <option value="closed">Cerrado</option>
                <option value="hours">Horario especial</option>
              </select>
            </label>
            {/* Siempre se envían (aunque estén ocultos) para que las listas del formulario queden alineadas */}
            <label className={`text-xs font-semibold ${r.mode === "hours" ? "" : "hidden"}`}>
              Abre
              <input type="time" name="special_open" value={r.open} onChange={(e) => update(r.key, { open: e.target.value })} className={`${cls} mt-1 block`} />
            </label>
            <label className={`text-xs font-semibold ${r.mode === "hours" ? "" : "hidden"}`}>
              Cierra
              <input type="time" name="special_close" value={r.close} onChange={(e) => update(r.key, { close: e.target.value })} className={`${cls} mt-1 block`} />
            </label>
            <label className="min-w-40 flex-1 text-xs font-semibold">
              Nota (visible en la web)
              <input name="special_note" value={r.note} maxLength={60} placeholder="Ej. Noël" onChange={(e) => update(r.key, { note: e.target.value })} className={`${cls} mt-1 block w-full`} />
            </label>
            <button type="button" onClick={() => setRows((x) => x.filter((y) => y.key !== r.key))} className="rounded-full border border-red-400/60 px-3 py-2 text-xs font-bold uppercase text-red-300">
              Quitar
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      <button
        type="button"
        onClick={() => setRows((r) => [...r, { key: `row-${nextKey.current++}`, date: "", mode: "closed", open: "10:00", close: "16:00", note: "" }])}
        className="mt-3 rounded-full border border-lime px-4 py-2 text-xs font-bold uppercase text-lime"
      >
        + Añadir día
      </button>
    </div>
  );
}
