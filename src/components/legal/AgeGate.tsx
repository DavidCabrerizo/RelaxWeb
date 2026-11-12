"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AGE_COOKIE, readCookie, writeCookie } from "@/lib/consent";
import { Logo } from "@/components/brand/Logo";

type Labels = { title: string; question: string; yes: string; no: string; notice: string; denied: string };

/**
 * Verificación de edad. Se monta en el cliente: el HTML de la página sigue siendo
 * indexable (los buscadores no ejecutan este paso como un usuario).
 */
const AGE_EVENT = "rs:age-confirmed";
const subscribe = (cb: () => void) => {
  window.addEventListener(AGE_EVENT, cb);
  return () => window.removeEventListener(AGE_EVENT, cb);
};
const isConfirmed = () => readCookie(AGE_COOKIE) === "1";

export function AgeGate({ labels }: { labels: Labels }) {
  // En el servidor se considera confirmado: el HTML estático no lleva el modal (y sigue siendo indexable)
  const confirmed = useSyncExternalStore(subscribe, isConfirmed, () => true);
  const [denied, setDenied] = useState(false);
  const yesRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const state: "hidden" | "ask" | "denied" = confirmed ? "hidden" : denied ? "denied" : "ask";

  useEffect(() => {
    if (state === "hidden") return;
    // Modal de verdad: el resto de la página queda inerte (ni Tab ni lectores de pantalla llegan a ella)
    const root = rootRef.current;
    const others = Array.from(document.body.children).filter((el): el is HTMLElement => el instanceof HTMLElement && el !== root && !el.inert);
    others.forEach((el) => (el.inert = true));
    document.body.style.overflow = "hidden";
    if (state === "ask") yesRef.current?.focus();
    else root?.focus();
    return () => {
      others.forEach((el) => (el.inert = false));
      document.body.style.overflow = "";
    };
  }, [state]);

  if (state === "hidden") return null;

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-title"
      className="fixed inset-0 z-[100] flex outline-none items-center justify-center bg-ink/95 px-4 backdrop-blur"
    >
      <div className="w-full max-w-md animate-rise rounded-[var(--radius-card)] border border-line-dark bg-ink-2 p-8 text-center">
        <Logo className="mx-auto w-48" />
        <h2 id="age-title" className="mt-6 text-lg font-extrabold uppercase">
          {labels.title}
        </h2>
        {state === "ask" ? (
          <>
            <p className="mt-2 text-muted-dark">{labels.question}</p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                ref={yesRef}
                type="button"
                onClick={() => {
                  writeCookie(AGE_COOKIE, "1", 365);
                  window.dispatchEvent(new Event(AGE_EVENT));
                }}
                className="min-h-12 rounded-full bg-lime px-6 font-bold uppercase tracking-wider text-ink transition hover:bg-lime-soft"
              >
                {labels.yes}
              </button>
              <button
                type="button"
                onClick={() => setDenied(true)}
                className="min-h-12 rounded-full border border-line-dark px-6 font-bold uppercase tracking-wider text-paper/80 transition hover:border-paper"
              >
                {labels.no}
              </button>
            </div>
          </>
        ) : (
          <p className="mt-4 text-muted-dark" role="alert">
            {labels.denied}
          </p>
        )}
        <p className="mt-6 text-xs text-muted-dark">{labels.notice}</p>
      </div>
    </div>
  );
}
