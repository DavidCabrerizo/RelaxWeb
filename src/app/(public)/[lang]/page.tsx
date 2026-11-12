import { notFound } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Waves } from "@/components/brand/Waves";
import { CategoryIcon, type CategoryIconName } from "@/components/brand/CategoryIcon";
import { ButtonLink } from "@/components/ui/Button";
import { isLocale, localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { DEFAULT_SETTINGS } from "@/lib/site/defaults";

/**
 * FASE 1 — Vista previa del sistema de diseño (hero, categorías, horario).
 * La home definitiva, con datos de Supabase, se construye en la Fase 2.
 */
const CATEGORIES: CategoryIconName[] = ["vape", "cbd", "eliquid", "accessories"];
// Slugs de las categorías sembradas en supabase/migrations/…_seed_base.sql
const CATEGORY_SLUG: Record<CategoryIconName, string> = {
  vape: "vape",
  cbd: "cbd",
  eliquid: "e-liquides",
  accessories: "accessoires",
};

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_20%,rgb(126_244_36/0.14),transparent_70%)]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-40 pt-16 text-center sm:pt-24">
          <h1 className="sr-only">Relax Sélection — Vape, CBD, e-liquides et accessoires à Genève</h1>
          <Logo className="w-full max-w-[420px] animate-rise" />
          <p className="eyebrow mt-8 text-muted-dark">
            {CATEGORIES.map((c, i) => (
              <span key={c} className="whitespace-nowrap">
                {i > 0 && <span className="mx-2 text-lime">•</span>}
                {t.categories[c]}
              </span>
            ))}
          </p>
          <p className="mt-6 max-w-xl text-base text-muted-dark sm:text-lg">
            Boutique multimarque au cœur de {DEFAULT_SETTINGS.city}. Conseils personnalisés en magasin.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href={localizedPath(lang, "/produits")}>{t.cta.seeProducts}</ButtonLink>
            <ButtonLink href={localizedPath(lang, "/contact")} variant="outline">
              {t.cta.directions}
            </ButtonLink>
          </div>
        </div>
        <Waves className="absolute inset-x-0 bottom-0 h-28 w-full sm:h-40" />
      </section>

      {/* CATEGORÍAS */}
      <section className="bg-ink-2 py-16">
        <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <a
                href={localizedPath(lang, `/categories/${CATEGORY_SLUG[c]}`)}
                className="group flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-line-dark p-6 transition hover:border-lime hover:shadow-glow"
              >
                <CategoryIcon icon={c} className="h-16 w-16 transition group-hover:scale-105" />
                <span className="text-sm font-bold uppercase tracking-wider">{t.categories[c]}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* HORARIO — superficie clara para probar contraste */}
      <section className="surface-light bg-mist py-16 text-ink">
        <div className="mx-auto max-w-md px-4">
          <p className="eyebrow text-lime-ink">{t.hours.title}</p>
          <dl className="mt-4 divide-y divide-line">
            {DEFAULT_SETTINGS.hours.map((h, i) => (
              <div key={i} className="flex justify-between py-2 text-sm">
                <dt className="font-semibold">{t.hours.days[i]}</dt>
                <dd className={h ? "" : "text-muted"}>
                  {h ? `${h.open.replace(":", "h")} – ${h.close.replace(":", "h")}` : t.hours.closed}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-xs text-muted">{t.age.notice}</p>
          <p className="mt-1 text-xs text-muted">{t.legal.cbd}</p>
        </div>
      </section>
    </main>
  );
}
