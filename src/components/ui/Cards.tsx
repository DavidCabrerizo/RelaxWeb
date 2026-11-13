import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import type { Brand, Product } from "@/lib/content/types";

/** Imagen del producto o, si aún no tiene foto, un marcador con el icono de su categoría. */
export function ProductMedia({
  product,
  priority,
  className = "",
  morph = true,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
  /** false en listas secundarias (p. ej. «relacionados»): solo viaja la foto del producto que se abre */
  morph?: boolean;
}) {
  const img = product.images[0];
  // Mismo nombre en la tarjeta y en la ficha: al abrir el producto, la foto «viaja» de una a otra.
  // Las fotos sin pareja en la página nueva salen y entran con el resto de la página (page-exit/enter).
  const media = (
    <div className={`relative aspect-[4/5] overflow-hidden bg-ink-3 ${className}`}>
      {img ? (
        <Image
          src={img.url}
          alt={img.alt || product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          preload={priority}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(70%_60%_at_50%_40%,rgb(126_244_36/0.12),transparent)]">
          <CategoryIcon
            icon={product.category.icon}
            className="h-20 w-20 opacity-80 transition duration-500 group-hover:scale-110"
          />
        </div>
      )}
    </div>
  );
  if (!morph) return media;
  return (
    <ViewTransition name={`produit-${product.slug}`} share="morph" enter="page-enter" exit="page-exit" default="none">
      {media}
    </ViewTransition>
  );
}

export function DemoBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-lime/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-lime">
      {label}
    </span>
  );
}

export function ProductCard({
  product,
  locale,
  demoLabel,
  morph = true,
  priority,
}: {
  product: Product;
  locale: Locale;
  demoLabel: string;
  morph?: boolean;
  /** Primeras tarjetas de la primera pantalla: la foto se carga ya (sin diferir) y con prioridad alta */
  priority?: boolean;
}) {
  return (
    <article className="reveal group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line-dark bg-ink-2 transition hover:border-lime/70 hover:shadow-glow">
      <ProductMedia product={product} morph={morph} priority={priority} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-dark">
            {product.brand.name}
          </p>
          {product.isDemo && <DemoBadge label={demoLabel} />}
        </div>
        <h3 className="text-base font-bold leading-snug">
          <Link href={localizedPath(locale, `/produits/${product.slug}`)} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-dark">{product.shortDescription}</p>
      </div>
    </article>
  );
}

export function BrandCard({ brand, locale, cta }: { brand: Brand; locale: Locale; cta: string }) {
  return (
    <article className="reveal group relative flex h-full flex-col justify-between gap-6 rounded-[var(--radius-card)] border border-line-dark bg-ink-2 p-6 transition hover:border-lime/70 hover:shadow-glow">
      <div>
        <div className="flex h-14 items-center">
          {brand.logoUrl ? (
            <Image
              src={brand.logoUrl}
              alt={brand.name}
              width={160}
              height={56}
              className="h-14 w-auto object-contain"
            />
          ) : (
            <span className="text-2xl font-extrabold uppercase tracking-tight">{brand.name}</span>
          )}
        </div>
        {brand.description && <p className="mt-3 text-sm text-muted-dark">{brand.description}</p>}
      </div>
      <Link
        href={localizedPath(locale, `/marques/${brand.slug}`)}
        className="text-sm font-bold uppercase tracking-wider text-lime after:absolute after:inset-0"
      >
        {cta} →
      </Link>
    </article>
  );
}
