"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { stripLocale } from "@/lib/i18n/path";

type Item = { path: string; label: string };

type Props = {
  locale: Locale;
  items: Item[];
  languages: { locale: Locale; label: string; short: string }[];
  labels: { menu: string; close: string; language: string };
};

export function HeaderNav({ locale, items, languages, labels }: Props) {
  const current = stripLocale(usePathname());
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(current);

  // Cerrar el menú al navegar (ajuste de estado durante el render, patrón recomendado por React)
  if (lastPath !== current) {
    setLastPath(current);
    setOpen(false);
  }

  // Bloquear el scroll de fondo mientras el menú está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (path: string) => (path === "/" ? current === "/" : current.startsWith(path));

  const links = items.map((it) => (
    <Link
      key={it.path}
      href={localizedPath(locale, it.path)}
      aria-current={isActive(it.path) ? "page" : undefined}
      className="rounded-full px-3 py-2 text-sm font-semibold uppercase tracking-wider text-paper/80 transition hover:text-lime aria-[current=page]:text-lime"
    >
      {it.label}
    </Link>
  ));

  const switcher = languages.length > 1 && (
    <nav aria-label={labels.language} className="flex items-center gap-1 rounded-full border border-line-dark p-1">
      {languages.map((l) => (
        <Link
          key={l.locale}
          href={localizedPath(l.locale, current)}
          hrefLang={l.locale}
          lang={l.locale}
          aria-current={l.locale === locale ? "true" : undefined}
          title={l.label}
          className="min-w-10 rounded-full px-2.5 py-1.5 text-center text-xs font-bold uppercase text-paper/70 transition hover:text-lime aria-[current=true]:bg-lime aria-[current=true]:text-ink"
        >
          {l.short}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Escritorio */}
      <div className="hidden items-center gap-4 md:flex">
        <nav aria-label="Navigation" className="flex items-center gap-1">
          {links}
        </nav>
        {switcher}
      </div>

      {/* Móvil */}
      <div className="flex items-center gap-2 md:hidden">
        {switcher}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line-dark text-paper"
        >
          <span className="sr-only">{open ? labels.close : labels.menu}</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Navigation"
          className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col gap-2 bg-ink px-4 pt-6 md:hidden"
        >
          {items.map((it) => (
            <Link
              key={it.path}
              href={localizedPath(locale, it.path)}
              aria-current={isActive(it.path) ? "page" : undefined}
              className="border-b border-line-dark py-4 text-2xl font-extrabold uppercase text-paper aria-[current=page]:text-lime"
            >
              {it.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
