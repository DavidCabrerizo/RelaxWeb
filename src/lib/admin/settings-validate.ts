/**
 * Validación de la configuración de la tienda (/admin/configuracion).
 * Módulo puro (sin dependencias de servidor) para poder probarlo con tests unitarios.
 */
import type { Database, Json } from "@/lib/supabase/database.types";

type SettingsUpdate = Database["public"]["Tables"]["site_settings"]["Update"];
export type SettingsResult = { values: SettingsUpdate; errors: Record<string, string> };

const get = (f: FormData, n: string, max: number) => {
  const v = f.get(n);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
};
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const PHONE = /^\+?[0-9 ().-]{6,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const GOOGLE_HOSTS = ["maps.app.goo.gl", "goo.gl", "g.page", "google.com", "www.google.com", "maps.google.com", "business.google.com", "www.google.ch", "google.ch"];
export const SOCIAL_HOSTS: Record<"instagram" | "facebook" | "tiktok", string[]> = {
  instagram: ["instagram.com", "www.instagram.com"],
  facebook: ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.com"],
  tiktok: ["tiktok.com", "www.tiktok.com"],
};

/** URL https cuyo dominio está en la lista (evita enlaces a sitios ajenos o javascript:). */
export function httpsUrlOn(value: string | null, hosts: string[]): boolean {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && hosts.includes(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function coord(v: string | null, min: number, max: number): number | null | "invalid" {
  if (!v) return null;
  const n = Number(v.replace(",", "."));
  if (!Number.isFinite(n) || n < min || n > max) return "invalid";
  return Math.round(n * 1e6) / 1e6;
}

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

function validDate(d: string) {
  if (!DATE.test(d)) return false;
  const x = new Date(`${d}T12:00:00Z`);
  return !Number.isNaN(x.getTime()) && x.toISOString().slice(0, 10) === d;
}

export function parseSettings(form: FormData): SettingsResult {
  const errors: Record<string, string> = {};

  const business_name = get(form, "business_name", 80);
  if (!business_name) errors.business_name = "El nombre comercial es obligatorio.";
  const address_city = get(form, "address_city", 60);
  if (!address_city) errors.address_city = "La localidad es obligatoria.";
  const address_postal_code = get(form, "address_postal_code", 10);
  if (address_postal_code && !/^[0-9A-Za-z -]{3,10}$/.test(address_postal_code)) errors.address_postal_code = "Código postal no válido.";

  const latitude = coord(get(form, "latitude", 20), -90, 90);
  const longitude = coord(get(form, "longitude", 20), -180, 180);
  if (latitude === "invalid") errors.latitude = "Latitud no válida (ej. 46.196782).";
  if (longitude === "invalid") errors.longitude = "Longitud no válida (ej. 6.146489).";
  if ((latitude === null) !== (longitude === null) && latitude !== "invalid" && longitude !== "invalid") {
    errors.latitude = "Indica latitud y longitud, o ninguna.";
  }

  const phone = get(form, "phone", 25);
  if (phone && !PHONE.test(phone)) errors.phone = "Teléfono no válido (ej. +41 78 616 20 82).";
  const whatsapp = get(form, "whatsapp", 25);
  if (whatsapp && !PHONE.test(whatsapp)) errors.whatsapp = "Número no válido.";
  const email = get(form, "email", 254);
  if (email && !EMAIL.test(email)) errors.email = "Email no válido.";

  const google_maps_url = get(form, "google_maps_url", 500);
  if (!httpsUrlOn(google_maps_url, GOOGLE_HOSTS)) errors.google_maps_url = "Debe ser un enlace https de Google Maps.";
  const google_business_url = get(form, "google_business_url", 500);
  if (!httpsUrlOn(google_business_url, GOOGLE_HOSTS)) errors.google_business_url = "Debe ser un enlace https de Google.";

  const social: Record<string, string> = {};
  for (const net of Object.keys(SOCIAL_HOSTS) as (keyof typeof SOCIAL_HOSTS)[]) {
    const v = get(form, `social_${net}`, 300);
    if (!v) continue;
    if (!httpsUrlOn(v, SOCIAL_HOSTS[net])) errors[`social_${net}`] = `Debe ser un enlace https de ${net}.`;
    else social[net] = v;
  }

  // Horario semanal: un tramo por día (1 = lunes … 7 = domingo)
  const opening: { day: number; open: string; close: string }[] = [];
  for (let d = 1; d <= 7; d++) {
    if (form.get(`closed_${d}`) === "on") continue;
    const open = get(form, `open_${d}`, 5);
    const close = get(form, `close_${d}`, 5);
    if (!open || !close || !TIME.test(open) || !TIME.test(close)) {
      errors[`open_${d}`] = "Indica apertura y cierre (HH:MM) o marca «Cerrado».";
      continue;
    }
    if (toMin(open) >= toMin(close)) {
      errors[`open_${d}`] = "La hora de cierre debe ser posterior a la de apertura.";
      continue;
    }
    opening.push({ day: d, open, close });
  }

  // Días excepcionales (filas dinámicas): special_date[], special_mode[], special_open[], special_close[], special_note[]
  const dates = form.getAll("special_date").map(String);
  const modes = form.getAll("special_mode").map(String);
  const opens = form.getAll("special_open").map(String);
  const closes = form.getAll("special_close").map(String);
  const notes = form.getAll("special_note").map(String);
  const special: { date: string; closed: boolean; open?: string; close?: string; note?: string }[] = [];
  const seen = new Set<string>();
  dates.slice(0, 40).forEach((date, i) => {
    const d = date.trim();
    if (!d) return;
    if (!validDate(d)) {
      errors.special = `Fecha no válida: ${d}`;
      return;
    }
    if (seen.has(d)) {
      errors.special = `Fecha repetida: ${d}`;
      return;
    }
    seen.add(d);
    const note = notes[i]?.trim().slice(0, 60) || undefined;
    if (modes[i] === "hours") {
      const o = opens[i]?.trim();
      const c = closes[i]?.trim();
      if (!o || !c || !TIME.test(o) || !TIME.test(c) || toMin(o) >= toMin(c)) {
        errors.special = `Horario no válido el ${d}.`;
        return;
      }
      special.push({ date: d, closed: false, open: o, close: c, note });
    } else {
      special.push({ date: d, closed: true, note });
    }
  });
  special.sort((a, b) => a.date.localeCompare(b.date));

  const enabled_locales = ["fr", ...(form.get("locale_en") === "on" ? ["en"] : [])];

  return {
    errors,
    values: {
      business_name: business_name ?? undefined,
      address_street: get(form, "address_street", 120),
      address_postal_code,
      address_city: address_city ?? undefined,
      latitude: latitude === "invalid" ? undefined : latitude,
      longitude: longitude === "invalid" ? undefined : longitude,
      phone,
      whatsapp,
      email,
      google_maps_url,
      google_business_url,
      social_links: social as Json,
      opening_hours: opening as unknown as Json,
      special_hours: special as unknown as Json,
      enabled_locales,
    },
  };
}
