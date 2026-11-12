import "server-only";
import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { createPublicClient, supabaseConfigured } from "@/lib/supabase/public";
import type { ContactInput } from "./validate";

export class ContactNotConfigured extends Error {}

/**
 * Credenciales SMTP solo por variables de entorno (nunca en el código):
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL.
 */
function transport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) throw new ContactNotConfigured();
  const port = Number(SMTP_PORT || 465);
  return {
    to: CONTACT_TO_EMAIL,
    from: CONTACT_FROM_EMAIL,
    mailer: nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465, // 465 = TLS directo; 587 = STARTTLS (requerido abajo)
      requireTLS: port !== 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    }),
  };
}

/** Envía el mensaje en texto plano (sin HTML: nada que inyectar). No se guarda en ninguna base de datos. */
export async function sendContactEmail(data: ContactInput, locale: string) {
  const { mailer, to, from } = transport();
  await mailer.sendMail({
    from: { name: "Site web Relax Sélection", address: from },
    to,
    replyTo: { name: data.name, address: data.email },
    subject: `Nouveau message du site web — ${data.name}`,
    text: [
      `Nom : ${data.name}`,
      `E-mail : ${data.email}`,
      `Langue du site : ${locale}`,
      "",
      data.message,
      "",
      "—",
      "Envoyé depuis le formulaire de contact. Répondez directement à cet e-mail pour écrire à la personne.",
    ].join("\n"),
  });
}

/**
 * Límite de envíos: se pasa a Supabase solo un hash SHA-256 (con sal secreta) de la IP.
 * Sin Supabase configurado (desarrollo local) no se limita.
 */
export async function rateLimitAllows(ip: string): Promise<boolean> {
  if (!supabaseConfigured()) return true;
  const salt = process.env.CONTACT_RATE_SALT || process.env.NEXT_PUBLIC_SUPABASE_URL || "relax-selection";
  const hash = createHash("sha256").update(`${salt}:${ip}`).digest("hex");
  const { data, error } = await createPublicClient().rpc("contact_rate_allow", { p_hash: hash });
  if (error) {
    console.error("[contact] límite de envíos no disponible", error.code);
    return true; // si el limitador falla no se bloquea a clientes reales; quedan honeypot y tiempo mínimo
  }
  return data === true;
}
