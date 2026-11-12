import type { OpeningSlot } from "@/lib/content/types";

/** Día (1 = lunes … 7 = domingo) y minutos del día en una zona horaria. */
export function zonedNow(timezone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return { day: days.indexOf(get("weekday")) + 1, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function openStatus(slots: OpeningSlot[], timezone: string, now = new Date()) {
  const { day, minutes } = zonedNow(timezone, now);
  const slot = slots.find((s) => s.day === day && minutes >= toMin(s.open) && minutes < toMin(s.close));
  return slot ? { open: true as const, closesAt: slot.close } : { open: false as const };
}

/** "10:00" → "10h00" en francés, "10:00" en inglés. */
export function formatTime(hhmm: string, locale: string) {
  return locale === "fr" ? hhmm.replace(":", "h") : hhmm;
}

/** Agrupa por día (1..7) para pintar la tabla de horarios. */
export function hoursByDay(slots: OpeningSlot[]) {
  return [1, 2, 3, 4, 5, 6, 7].map((day) => slots.filter((s) => s.day === day));
}
