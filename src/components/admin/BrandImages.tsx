"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeBrandImage, setBrandImage } from "@/app/(admin)/admin/(panel)/marcas/image-actions";
import { ACCEPT, compressAndUpload, ImageError } from "./upload";

type Slot = { kind: "logo" | "cover"; label: string; hint: string; url?: string };

/** Logotipo (fondo transparente conservado, 800 px) y portada (2000 px) de una marca. */
export function BrandImages({ brandId, logoUrl, coverUrl }: { brandId: string; logoUrl?: string; coverUrl?: string }) {
  const slots: Slot[] = [
    { kind: "logo", label: "Logotipo", hint: "PNG o WebP con fondo transparente, idealmente horizontal.", url: logoUrl },
    { kind: "cover", label: "Imagen de portada", hint: "Foto horizontal (16:9) para la página de la marca.", url: coverUrl },
  ];
  return (
    <section aria-labelledby="h-brand-images" className="rounded-2xl border border-line-dark bg-ink-2 p-5">
      <h2 id="h-brand-images" className="text-sm font-bold uppercase tracking-wider">Imágenes de la marca</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {slots.map((s) => (
          <ImageSlot key={s.kind} brandId={brandId} slot={s} />
        ))}
      </div>
    </section>
  );
}

function ImageSlot({ brandId, slot }: { brandId: string; slot: Slot }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, startTransition] = useTransition();

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const up = await compressAndUpload(file, `brands/${brandId}`, {
        maxSide: slot.kind === "logo" ? 800 : 2000,
        keepAlpha: slot.kind === "logo",
        prefix: `${slot.kind}-`,
      });
      const r = await setBrandImage(brandId, slot.kind, up);
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
      <p className="text-sm font-semibold">{slot.label}</p>
      <div
        className={`mt-2 flex items-center justify-center overflow-hidden rounded-lg bg-ink-3 ${slot.kind === "logo" ? "aspect-[3/1]" : "aspect-video"} ${
          uploading || busy ? "opacity-60" : ""
        }`}
      >
        {slot.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slot.url} alt="" className={slot.kind === "logo" ? "max-h-full max-w-full object-contain p-3" : "h-full w-full object-cover"} />
        ) : (
          <span className="text-xs text-muted-dark">{uploading ? "Subiendo…" : "Sin imagen"}</span>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-dark">{slot.hint}</p>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase">
        <label className="cursor-pointer rounded-full bg-lime px-3 py-1.5 text-ink">
          {slot.url ? "Sustituir" : "Subir"}
          <input type="file" accept={ACCEPT} className="sr-only" disabled={uploading} onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {slot.url && (
          <button
            type="button"
            onClick={() =>
              window.confirm(`¿Quitar ${slot.label.toLowerCase()}?`) &&
              startTransition(async () => {
                const r = await removeBrandImage(brandId, slot.kind);
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
