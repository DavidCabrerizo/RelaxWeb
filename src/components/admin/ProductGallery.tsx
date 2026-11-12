"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  deleteProductImage,
  moveImage,
  registerProductImages,
  replaceProductImage,
  setPrimaryImage,
  updateImageAlt,
  type ImageResult,
} from "@/app/(admin)/admin/(panel)/productos/image-actions";
import { ACCEPT, compressAndUpload, ImageError } from "./upload";

export type GalleryImage = { id: string; url: string; isPrimary: boolean; alt: { fr?: string; en?: string } };
type Pending = { key: string; preview: string; name: string; state: "uploading" | "error"; error?: string };

const MAX_SIDE = 2000;

export function ProductGallery({ productId, images }: { productId: string; images: GalleryImage[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, startTransition] = useTransition();

  const run = (fn: () => Promise<ImageResult>) =>
    startTransition(async () => {
      const r = await fn();
      if (r.message || !r.ok) setMessage({ ok: r.ok, text: r.message ?? "Ha ocurrido un error." });
      router.refresh();
    });

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setMessage(null);
    const list = Array.from(files).slice(0, 12);
    const items: Pending[] = list.map((f) => ({ key: crypto.randomUUID(), preview: URL.createObjectURL(f), name: f.name, state: "uploading" }));
    setPending((p) => [...p, ...items]);

    const results = await Promise.all(
      list.map(async (file, i) => {
        try {
          return await compressAndUpload(file, `products/${productId}`, { maxSide: MAX_SIDE });
        } catch (e) {
          const text = e instanceof ImageError ? e.message : "Error al subir.";
          setPending((p) => p.map((x) => (x.key === items[i].key ? { ...x, state: "error", error: text } : x)));
          return null;
        }
      }),
    );
    const ok = results.filter((r): r is NonNullable<typeof r> => r !== null);
    if (ok.length) {
      const r = await registerProductImages(productId, ok);
      if (!r.ok || r.message) setMessage({ ok: r.ok, text: r.message ?? "Error al guardar." });
      router.refresh();
    }
    // Se retiran las vistas previas que han ido bien; las fallidas se quedan con su error
    setPending((p) => p.filter((x) => !items.some((it) => it.key === x.key) || x.state === "error"));
    items.forEach((it) => URL.revokeObjectURL(it.preview));
    if (input.current) input.current.value = "";
  }

  async function onReplace(imageId: string, file: File | undefined) {
    if (!file) return;
    setMessage(null);
    try {
      const up = await compressAndUpload(file, `products/${productId}`, { maxSide: MAX_SIDE });
      run(() => replaceProductImage(imageId, up));
    } catch (e) {
      setMessage({ ok: false, text: e instanceof ImageError ? e.message : "Error al subir." });
    }
  }

  return (
    <section aria-labelledby="h-gallery" className="rounded-2xl border border-line-dark bg-ink-2 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="h-gallery" className="text-sm font-bold uppercase tracking-wider">Fotografías</h2>
          <p className="text-xs text-muted-dark">JPG, PNG, WebP o AVIF · se optimizan automáticamente · máx. 12</p>
        </div>
        <label className="cursor-pointer rounded-full bg-lime px-5 py-2.5 text-sm font-bold uppercase text-ink hover:bg-lime-soft">
          + Añadir fotos
          <input ref={input} type="file" accept={ACCEPT} multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
        </label>
      </div>

      {message && (
        <p role={message.ok ? "status" : "alert"} className={`mt-4 rounded-xl px-4 py-2 text-sm ${message.ok ? "bg-lime/10 text-lime" : "bg-red-500/10 text-red-200"}`}>
          {message.text}
        </p>
      )}

      {images.length === 0 && pending.length === 0 && (
        <p className="mt-4 rounded-xl border border-dashed border-line-dark p-6 text-center text-sm text-muted-dark">
          Sin fotos todavía. La web muestra el icono de la categoría.
        </p>
      )}

      <ul className={`mt-4 grid gap-4 sm:grid-cols-2 ${busy ? "opacity-70" : ""}`} aria-busy={busy}>
        {images.map((img, i) => (
          <li key={img.id} className={`overflow-hidden rounded-xl border ${img.isPrimary ? "border-lime" : "border-line-dark"} bg-ink`}>
            <div className="relative aspect-[4/3] bg-ink-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt.fr ?? ""} className="h-full w-full object-cover" loading="lazy" />
              {img.isPrimary && (
                <span className="absolute left-2 top-2 rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-bold uppercase text-ink">Principal</span>
              )}
            </div>
            <div className="space-y-3 p-3">
              <div className="flex flex-wrap gap-2 text-xs font-bold uppercase">
                {!img.isPrimary && (
                  <button type="button" onClick={() => run(() => setPrimaryImage(img.id))} className="rounded-full border border-lime px-3 py-1.5 text-lime">
                    Hacer principal
                  </button>
                )}
                <button type="button" disabled={i === 0} onClick={() => run(() => moveImage(img.id, "up"))} aria-label="Mover antes" className="rounded-full border border-line-dark px-3 py-1.5 disabled:opacity-30">
                  ←
                </button>
                <button type="button" disabled={i === images.length - 1} onClick={() => run(() => moveImage(img.id, "down"))} aria-label="Mover después" className="rounded-full border border-line-dark px-3 py-1.5 disabled:opacity-30">
                  →
                </button>
                <label className="cursor-pointer rounded-full border border-line-dark px-3 py-1.5">
                  Sustituir
                  <input type="file" accept={ACCEPT} className="sr-only" onChange={(e) => onReplace(img.id, e.target.files?.[0])} />
                </label>
                <button
                  type="button"
                  onClick={() => window.confirm("¿Eliminar esta foto?") && run(() => deleteProductImage(img.id))}
                  className="rounded-full border border-red-400/60 px-3 py-1.5 text-red-300"
                >
                  Eliminar
                </button>
              </div>
              <AltEditor image={img} onSave={(fr, en) => run(() => updateImageAlt(img.id, fr, en))} />
            </div>
          </li>
        ))}
        {pending.map((p) => (
          <li key={p.key} className="overflow-hidden rounded-xl border border-dashed border-line-dark bg-ink">
            <div className="relative aspect-[4/3] bg-ink-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt="" className="h-full w-full object-cover opacity-60" />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {p.state === "uploading" ? "Subiendo…" : ""}
              </span>
            </div>
            <p className={`p-3 text-xs ${p.state === "error" ? "text-red-300" : "text-muted-dark"}`}>
              {p.name}
              {p.error && ` — ${p.error}`}
              {p.state === "error" && (
                <button type="button" className="ml-2 underline" onClick={() => setPending((x) => x.filter((y) => y.key !== p.key))}>
                  Quitar
                </button>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AltEditor({ image, onSave }: { image: GalleryImage; onSave: (fr: string, en: string) => void }) {
  const [fr, setFr] = useState(image.alt.fr ?? "");
  const [en, setEn] = useState(image.alt.en ?? "");
  const dirty = fr !== (image.alt.fr ?? "") || en !== (image.alt.en ?? "");
  const cls = "mt-1 block w-full rounded-lg border border-line-dark bg-ink-2 px-2.5 py-1.5 text-xs outline-none focus:border-lime";
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-semibold text-muted-dark">
        Texto alternativo FR
        <input value={fr} maxLength={160} onChange={(e) => setFr(e.target.value)} placeholder="Ex. : Kit pod compact noir, vue de face" className={cls} />
      </label>
      <label className="block text-[11px] font-semibold text-muted-dark">
        Texto alternativo EN
        <input value={en} maxLength={160} onChange={(e) => setEn(e.target.value)} className={cls} />
      </label>
      {dirty && (
        <button type="button" onClick={() => onSave(fr, en)} className="rounded-full bg-lime px-3 py-1.5 text-xs font-bold uppercase text-ink">
          Guardar textos
        </button>
      )}
    </div>
  );
}
