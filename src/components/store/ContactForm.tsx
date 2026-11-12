"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { sendContact, type ContactState } from "@/app/(public)/[lang]/contact/actions";

type Labels = {
  name: string;
  email: string;
  message: string;
  consent: string;
  privacy: string;
  submit: string;
  sending: string;
  required: string;
};

const input =
  "mt-1 block w-full rounded-xl border border-line-dark bg-ink px-4 py-3 text-paper outline-none transition focus:border-lime aria-[invalid=true]:border-red-400";

export function ContactForm({ lang, labels, privacyHref }: { lang: string; labels: Labels; privacyHref: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, {});
  const [startedAt, setStartedAt] = useState("");
  const msgRef = useRef<HTMLParagraphElement>(null);

  // Momento en que se mostró el formulario (antispam: los bots envían al instante)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- la hora solo existe en el navegador
    setStartedAt(String(Date.now()));
  }, []);
  useEffect(() => {
    if (state.message) msgRef.current?.focus();
  }, [state]);

  if (state.ok) {
    return (
      <p ref={msgRef} tabIndex={-1} role="status" className="rounded-xl border border-lime/50 bg-lime/10 px-4 py-4 text-lime outline-none">
        {state.message}
      </p>
    );
  }

  const err = (n: string) => state.errors?.[n];
  const field = (n: string) => ({
    "aria-invalid": err(n) ? true : undefined,
    "aria-describedby": err(n) ? `cf-${n}-error` : undefined,
  });

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="t" value={startedAt} />
      {/* Honeypot: oculto para personas y lectores de pantalla */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.message && (
        <p ref={msgRef} tabIndex={-1} role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 outline-none">
          {state.message}
        </p>
      )}

      <label className="block text-sm font-semibold">
        {labels.name} *
        <input name="name" required maxLength={100} autoComplete="name" defaultValue={state.values?.name} className={input} {...field("name")} />
        {err("name") && <span id="cf-name-error" className="mt-1 block text-xs font-normal text-red-300">{err("name")}</span>}
      </label>
      <label className="block text-sm font-semibold">
        {labels.email} *
        <input name="email" type="email" required maxLength={254} autoComplete="email" defaultValue={state.values?.email} className={input} {...field("email")} />
        {err("email") && <span id="cf-email-error" className="mt-1 block text-xs font-normal text-red-300">{err("email")}</span>}
      </label>
      <label className="block text-sm font-semibold">
        {labels.message} *
        <textarea name="message" required minLength={10} maxLength={3000} rows={5} defaultValue={state.values?.message} className={input} {...field("message")} />
        {err("message") && <span id="cf-message-error" className="mt-1 block text-xs font-normal text-red-300">{err("message")}</span>}
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-lime)]" {...field("consent")} />
        <span>
          {labels.consent}{" "}
          <Link href={privacyHref} className="text-lime underline-offset-4 hover:underline">
            {labels.privacy}
          </Link>
          {err("consent") && <span id="cf-consent-error" className="mt-1 block text-xs text-red-300">{err("consent")}</span>}
        </span>
      </label>
      <p className="text-xs text-muted-dark">* {labels.required}</p>
      <button
        type="submit"
        disabled={pending || !startedAt}
        className="min-h-12 w-full rounded-full bg-lime px-6 font-bold uppercase tracking-wider text-ink transition hover:bg-lime-soft disabled:opacity-60 sm:w-auto"
      >
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
