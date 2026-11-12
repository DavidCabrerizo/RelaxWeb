/**
 * Validación del formulario de contacto (módulo puro, probado con tests unitarios).
 * Devuelve códigos de error; los textos están en los diccionarios FR/EN.
 */
export type ContactErrorCode = "required" | "email" | "messageLength" | "consent";
export type ContactInput = { name: string; email: string; message: string };
export type ContactParse =
  | { kind: "ok"; data: ContactInput }
  | { kind: "invalid"; errors: Record<string, ContactErrorCode>; values: Partial<ContactInput> }
  | { kind: "bot" }; // honeypot rellenado o envío demasiado rápido: se finge éxito

export const MIN_FILL_MS = 3000; // menos de 3 s desde que se cargó el formulario = bot
export const MAX_FILL_MS = 2 * 60 * 60 * 1000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const text = (f: FormData, n: string, max: number) => {
  const v = f.get(n);
  return typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "";
};

export function parseContact(form: FormData, now = Date.now()): ContactParse {
  // Honeypot: campo oculto que un humano no ve ni rellena
  if (text(form, "website", 200)) return { kind: "bot" };
  const started = Number(form.get("t"));
  if (!Number.isFinite(started) || now - started < MIN_FILL_MS || now - started > MAX_FILL_MS) return { kind: "bot" };

  // El nombre no puede contener saltos de línea (evita inyección de cabeceras en el email)
  const name = text(form, "name", 100).replace(/[\r\n\t]+/g, " ");
  const email = text(form, "email", 254).toLowerCase();
  const message = text(form, "message", 3000);
  const consent = form.get("consent") === "on";

  const errors: Record<string, ContactErrorCode> = {};
  if (name.length < 2) errors.name = "required";
  if (!EMAIL.test(email) || /[\r\n]/.test(email)) errors.email = "email";
  if (message.length < 10) errors.message = "messageLength";
  if (!consent) errors.consent = "consent";

  if (Object.keys(errors).length) return { kind: "invalid", errors, values: { name, email, message } };
  return { kind: "ok", data: { name, email, message } };
}
