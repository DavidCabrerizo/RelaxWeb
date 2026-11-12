"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ACCEPT, compressAndUpload, ImageError } from "./upload";

type Result = { ok: boolean; message?: string };

/**
 * Hueco para UNA imagen (subir / sustituir / quitar). Las acciones de servidor llegan
 * ya enlazadas a su destino (p. ej. setContentImage.bind(null, "home_hero")).
 */
export function SingleImage({
  label,
  hint,
  url,
  folder,
  prefix,
  maxSide,
  keepAlpha,
  aspect = "aspect-video",
  contain,
  onSet,
  onRemove,
}: {
  label: string;
  hint?: string;
  url?: string;
  folder: string;
  prefix: string;
  maxSide: number;
  keepAlpha?: boolean;
  aspect?: string;
  contain?: boolean;
  onSet: (upload: { path: string; width: number; height: number }) => Promise<Result>;
  onRemove: () => Promise<Result>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, startTransition] = useTransition();

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const up = await compressAndUpload(file, folder, { maxSide, keepAlpha, prefix });
      const r = await onSet(up);
      if (!r.ok) setError(r.message ?? "Error al guardar.");
      router.refresh();
    } catch (e) {
      setError(e instanceof ImageError ? e.message : "Error al subir.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-line-dark bg-ink p-3">
      <p className="text-sm font-semibold">{label}</p>
      <div className={`mt-2 flex items-center justify-center overflow-hidden rounded-lg bg-ink-3 ${aspect} ${uploading || busy ? "opacity-60" : ""}`}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className={contain ? "max-h-full max-w-full object-contain p-3" : "h-full w-full object-cover"} />
        ) : (
          <span className="text-xs text-muted-dark">{uploading ? "Subiendo…" : "Sin imagen"}</span>
        )}
      </div>
      {hint && <p className="mt-2 text-xs text-muted-dark">{hint}</p>}
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase">
        <label className="cursor-pointer rounded-full bg-lime px-3 py-1.5 text-ink">
          {url ? "Sustituir" : "Subir"}
          <input type="file" accept={ACCEPT} className="sr-only" disabled={uploading} onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {url && (
          <button
            type="button"
            onClick={() =>
              window.confirm("¿Quitar esta imagen?") &&
              startTransition(async () => {
                const r = await onRemove();
                if (!r.ok) setError(r.message ?? "Error.");
                router.refresh();
              })
            }
            className="rounded-full border border-red-400/60 px-3 py-1.5 text-red-300"
          >
            Quitar
          </button>
        )}
      </div>
    </div>
  );
}
