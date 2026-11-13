"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HempLeaf } from "@/components/brand/HempLeaf";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { stripLocale } from "@/lib/i18n/path";

type Item = { path: string; label: string };

type Props = {
  locale: Locale;
  items: Item[];
  languages: { locale: Locale; label: string; short: string }[];
  labels: { menu: string; close: string; language: string };
  /** Accesos directos de la tienda al pie del menú móvil (null si falta el dato: no se inventan) */
  quick: {
    directions: string | null;
    tel: string | null;
    address: string;
    labels: { directions: string; call: string };
  };
};

export function HeaderNav({ locale, items, languages, labels, quick }: Props) {
  const current = stripLocale(usePathname());
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(current);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cerrar el menú al navegar (ajuste de estado durante el render, patrón recomendado por React)
  if (lastPath !== current) {
    setLastPath(current);
    setOpen(false);
  }

  // Menú abierto: sin scroll de fondo y Escape lo cierra devolviendo el foco al botón
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    // El contenido de detrás queda inerte: ni Tab ni lectores de pantalla llegan a él
    const behind = [document.getElementById("contenu"), document.querySelector("body > footer")].filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
    behind.forEach((el) => (el.inert = true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      behind.forEach((el) => (el.inert = false));
      document.removeEventListener("keydown", onKey);
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
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition ${
            open ? "border-lime bg-lime text-ink" : "border-line-dark text-lime hover:border-lime/70"
          }`}
        >
          <span className="sr-only">{open ? labels.close : labels.menu}</span>
          {/* Hoja de cáñamo (cerrado) que gira y se convierte en una X (abierto) */}
          <HempLeaf
            className={`absolute h-6 w-6 transition duration-300 ${open ? "rotate-90 scale-50 opacity-0" : "rotate-0 opacity-100"}`}
          />
          <svg
            viewBox="0 0 24 24"
            className={`absolute h-5 w-5 transition duration-300 ${open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      {/* El panel se monta en <body> y no dentro de la cabecera: el desenfoque (backdrop-filter) de la
          cabecera convierte a esta en el contenedor de los elementos «fixed», y el panel quedaba de
          64 px de alto, sin fondo, con los enlaces flotando sobre la página. */}
      {open &&
        createPortal(
          <nav
            id="mobile-menu"
            aria-label="Navigation"
            className="mobile-menu fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-ink md:hidden"
          >
            {/* Decoración: brillo verde y hoja de cáñamo muy tenue */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_100%_0%,rgb(126_244_36/0.14),transparent_70%)]"
            />
            <HempLeaf className="pointer-events-none absolute -bottom-10 -right-16 h-80 w-80 rotate-[-18deg] text-lime opacity-[0.05]" />

            <ul className="relative flex flex-col px-5 pt-4">
              {items.map((it, i) => (
                <li key={it.path} className="mobile-menu-item" style={{ animationDelay: `${60 + i * 55}ms` }}>
                  <Link
                    href={localizedPath(locale, it.path)}
                    aria-current={isActive(it.path) ? "page" : undefined}
                    className="group flex items-center gap-4 border-b border-line-dark py-5 text-paper transition aria-[current=page]:text-lime"
                  >
                    <span className="w-7 font-mono text-xs text-lime/80" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-[1.65rem] font-extrabold uppercase leading-none tracking-tight">
                      {it.label}
                    </span>
                    <span aria-hidden="true" className="text-xl text-lime transition group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {(quick.directions || quick.tel) && (
              <div
                className="mobile-menu-item relative mt-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8"
                style={{ animationDelay: `${60 + items.length * 55}ms` }}
              >
                {quick.address && <p className="mb-3 text-sm text-muted-dark">{quick.address}</p>}
                <div className="grid grid-cols-2 gap-3">
                  {quick.directions && (
                    <a
                      href={quick.directions}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-lime px-4 text-sm font-bold uppercase tracking-wider text-ink"
                    >
                      {quick.labels.directions}
                    </a>
                  )}
                  {quick.tel && (
                    <a
                      href={quick.tel}
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-lime px-4 text-sm font-bold uppercase tracking-wider text-lime"
                    >
                      {quick.labels.call}
                    </a>
                  )}
                </div>
              </div>
            )}
          </nav>,
          document.body,
        )}
    </>
  );
}
