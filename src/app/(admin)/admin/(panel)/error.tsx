"use client";

import { useEffect } from "react";

/** Error inesperado en el panel (p. ej. sin conexión con Supabase). */
export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-xl">
      <h1 className="text-2xl font-bold">No se ha podido cargar esta sección</h1>
      <p className="mt-3 text-muted-dark">
        Puede ser un corte momentáneo de conexión con la base de datos. Vuelve a intentarlo; si el problema continúa,
        avisa al desarrollador indicando la referencia.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-lime px-5 text-sm font-bold text-ink hover:bg-lime-soft"
      >
        Reintentar
      </button>
      {error.digest && <p className="mt-4 font-mono text-xs text-muted-dark">Referencia: {error.digest}</p>}
    </main>
  );
}
