"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const input =
  "mt-1 block min-h-12 w-full rounded-xl border border-line-dark bg-ink px-4 text-paper outline-none transition focus:border-lime";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const message = state.error ?? notice;

  return (
    <form action={action} className="space-y-4" noValidate={false}>
      {message && (
        <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {message}
        </p>
      )}
      <label className="block text-sm font-semibold">
        Correo electrónico
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue={state.email}
          maxLength={254}
          className={input}
        />
      </label>
      <label className="block text-sm font-semibold">
        Contraseña
        <input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="current-password"
          className={input}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-full rounded-full bg-lime font-bold uppercase tracking-wider text-ink transition hover:bg-lime-soft disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
