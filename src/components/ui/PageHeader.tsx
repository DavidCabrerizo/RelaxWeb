import Link from "next/link";
import { localizedPath, type Locale } from "@/lib/i18n/config";

type Crumb = { label: string; path?: string };

/** Fil d'Ariane visible. El BreadcrumbList en JSON-LD se añade en la Fase 7. */
export function Breadcrumbs({ locale, items, label }: { locale: Locale; items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label} className="text-xs text-muted-dark">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true" className="text-lime">/</span>}
            {c.path ? (
              <Link href={localizedPath(locale, c.path)} className="hover:text-lime">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-paper/90">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b border-line-dark">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_85%_0%,rgb(126_244_36/0.12),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-8 sm:pb-14">
        {children}
        {eyebrow && <p className="eyebrow mt-6 text-lime">{eyebrow}</p>}
        <h1 className="display mt-3 text-3xl sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-muted-dark sm:text-lg">{intro}</p>}
      </div>
    </div>
  );
}

export function SectionTitle({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="display text-2xl sm:text-3xl">{title}</h2>
        {text && <p className="mt-2 max-w-xl text-muted-dark">{text}</p>}
      </div>
      {action}
    </div>
  );
}
