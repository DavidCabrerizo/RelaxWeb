import Link from "next/link";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { Waves } from "@/components/brand/Waves";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Category, SiteSettings } from "@/lib/content/types";
import { OpeningHours } from "@/components/store/OpeningHours";
import { CurrentYear } from "./CurrentYear";

/** Año de referencia del build; el componente cliente lo corrige si ha cambiado. */
const BUILD_YEAR = 2026;

type Props = { locale: Locale; t: Dictionary; settings: SiteSettings; categories: Category[]; tagline: string };

export function Footer({ locale, t, settings, categories, tagline }: Props) {
  const L = (p: string) => localizedPath(locale, p);

  return (
    <footer className="relative mt-24 bg-ink-2">
      <Waves className="absolute inset-x-0 -top-16 h-16 w-full sm:-top-24 sm:h-24" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-10 pt-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <SiteLogo url={settings.logoDarkUrl} className="h-auto w-44" />
          <p className="mt-4 text-sm text-muted-dark">{tagline}</p>
          <p className="mt-2 text-sm text-muted-dark">
            {[settings.street, [settings.postalCode, settings.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
          </p>
          {settings.phone && (
            <p className="mt-1 text-sm">
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="text-paper/80 hover:text-lime">
                {settings.phone}
              </a>
            </p>
          )}
          <SocialLinks social={settings.social} />
        </div>

        <nav aria-label={t.footer.explore}>
          <p className="eyebrow text-lime">{t.footer.explore}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link className="text-paper/80 hover:text-lime" href={L(`/categories/${c.slug}`)}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link className="text-paper/80 hover:text-lime" href={L("/marques")}>
                {t.nav.brands}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="eyebrow text-lime">{t.hours.title}</p>
          <OpeningHours locale={locale} t={t} slots={settings.openingHours} compact className="mt-4" />
        </div>

        <nav aria-label={t.footer.info}>
          <p className="eyebrow text-lime">{t.footer.info}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="text-paper/80 hover:text-lime" href={L("/a-propos")}>{t.nav.about}</Link></li>
            <li><Link className="text-paper/80 hover:text-lime" href={L("/contact")}>{t.nav.contact}</Link></li>
            <li><Link className="text-paper/80 hover:text-lime" href={L("/mentions-legales")}>{t.legal.legalTitle}</Link></li>
            <li><Link className="text-paper/80 hover:text-lime" href={L("/confidentialite")}>{t.legal.privacyTitle}</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-line-dark">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-dark sm:flex-row sm:justify-between">
          <p>{t.age.notice} {t.legal.cbd}</p>
          <p className="shrink-0">© <CurrentYear initial={BUILD_YEAR} /> {settings.businessName}. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}

const SOCIAL_LABEL = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok" } as const;

function SocialLinks({ social }: { social: SiteSettings["social"] }) {
  const items = (Object.keys(SOCIAL_LABEL) as (keyof typeof SOCIAL_LABEL)[]).filter((k) => social[k]);
  if (!items.length) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((k) => (
        <li key={k}>
          <a
            href={social[k]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center rounded-full border border-line-dark px-3 text-xs font-bold uppercase tracking-wider text-paper/80 hover:border-lime hover:text-lime"
          >
            {SOCIAL_LABEL[k]}
          </a>
        </li>
      ))}
    </ul>
  );
}
