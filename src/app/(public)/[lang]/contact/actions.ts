"use server";

import { headers } from "next/headers";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { parseContact } from "@/lib/contact/validate";
import { ContactNotConfigured, rateLimitAllows, sendContactEmail } from "@/lib/contact/send";

export type ContactState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: { name?: string; email?: string; message?: string };
};

export async function sendContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const lang = String(form.get("lang"));
  const t = await getDictionary(isLocale(lang) ? lang : "fr");
  const f = t.contact.form;

  const parsed = parseContact(form);
  // Bot detectado: se responde como si todo fuera bien (no se le da información)
  if (parsed.kind === "bot") return { ok: true, message: f.success };
  if (parsed.kind === "invalid") {
    const errors = Object.fromEntries(Object.entries(parsed.errors).map(([k, code]) => [k, f.errors[code]]));
    return { errors, values: parsed.values, message: f.errors.check };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  if (!(await rateLimitAllows(ip))) return { message: f.errors.rate, values: parsed.data };

  try {
    await sendContactEmail(parsed.data, lang);
  } catch (e) {
    if (e instanceof ContactNotConfigured) console.error("[contact] SMTP sin configurar (variables SMTP_* y CONTACT_*)");
    else console.error("[contact] error de envío", (e as Error).message);
    return { message: f.errors.unavailable, values: parsed.data };
  }
  return { ok: true, message: f.success };
}
