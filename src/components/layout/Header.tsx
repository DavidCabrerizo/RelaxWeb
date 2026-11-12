import Link from "next/link";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getEnabledLocales } from "@/lib/site/defaults";
import { HeaderNav } from "./HeaderNav";

export async function Header({ locale, t, logoUrl }: { locale: Locale; t: Dictionary; logoUrl?: string }) {
  const items = [
    { path: "/produits", label: t.nav.products },
    { path: "/marques", label: t.nav.brands },
    { path: "/a-propos", label: t.nav.about },
    { path: "/contact", label: t.nav.contact },
  ];
  const languages = (await getEnabledLocales()).map((l) => ({ locale: l, label: t.language[l], short: l }));

  return (
    <header className="sticky top-0 z-50 border-b border-line-dark/70 bg-ink/90 backdrop-blur supports-[backdrop-filter]:bg-ink/75">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:text-ink"
      >
        {t.nav.skip}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href={localizedPath(locale, "/")} className="shrink-0" aria-label={`Relax Sélection — ${t.nav.home}`}>
          <SiteLogo url={logoUrl} showTagline={false} className="h-9 w-auto max-w-[160px]" />
        </Link>
        <HeaderNav
          locale={locale}
          items={items}
          languages={languages}
          labels={{ menu: t.nav.menu, close: t.nav.close, language: t.language.label }}
        />
      </div>
    </header>
  );
}
