"use client";

import "./globals.css";

/**
 * Último recurso: error en un layout raíz (no hay cabecera ni pie disponibles).
 * Debe incluir <html> y <body>. Estilos mínimos para no depender de nada más.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body className="flex min-h-dvh items-center justify-center bg-ink px-4 font-sans text-paper">
        <main className="max-w-md text-center">
          <h1 className="text-2xl font-bold">
            Un problème est survenu
            <span lang="en" className="mt-2 block text-base font-semibold text-muted-dark">Something went wrong</span>
          </h1>
          <p className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="min-h-12 rounded-full bg-lime px-6 text-sm font-bold uppercase text-ink">
              Réessayer · Retry
            </button>
            {/* <a> y no <Link>: tras un error, una recarga completa limpia el estado roto */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="inline-flex min-h-12 items-center rounded-full border border-lime px-6 text-sm font-bold uppercase text-lime">
              Accueil · Home
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
