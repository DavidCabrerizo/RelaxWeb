"use client";

import { useEffect } from "react";
import { Waves } from "@/components/brand/Waves";

/**
 * Error inesperado en una página pública (p. ej. la base de datos no responde).
 * Mantiene cabecera y pie. Textos en los dos idiomas: este componente no recibe el idioma.
 */
export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative overflow-hidden" aria-labelledby="h-error">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-40 pt-20 text-center">
        <h1 id="h-error" className="display text-2xl sm:text-3xl">
          Un problème est survenu
          <span className="mt-2 block text-base font-semibold normal-case text-muted-dark">Something went wrong</span>
        </h1>
        <p className="mt-4 max-w-md text-muted-dark">
          Réessayez dans quelques instants. <span lang="en">Please try again in a moment.</span>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-lime px-6 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-lime-soft"
          >
            Réessayer · Retry
          </button>
          {/* <a> y no <Link>: tras un error, una recarga completa limpia el estado roto */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-lime px-6 text-sm font-bold uppercase tracking-wider text-lime transition hover:bg-lime hover:text-ink"
          >
            Accueil · Home
          </a>
        </div>
        {error.digest && <p className="mt-6 font-mono text-xs text-muted-dark">Réf. {error.digest}</p>}
      </div>
      <Waves className="absolute inset-x-0 bottom-0 h-24 w-full" />
    </section>
  );
}
