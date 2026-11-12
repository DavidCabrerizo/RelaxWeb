import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Waves } from "@/components/brand/Waves";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { ButtonLink } from "@/components/ui/Button";
import { BrandCard, ProductCard } from "@/components/ui/Cards";
import { SectionTitle } from "@/components/ui/PageHeader";
import { OpeningHours } from "@/components/store/OpeningHours";
import { OpenNowBadge } from "@/components/store/OpenNowBadge";
import { ContactActions } from "@/components/store/ContactActions";
import { isLocale, localizedPath } from "@/lib/i18n/config";
import { pageContext } from "@/lib/i18n/page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo/metadata";
import { getBrands, getCategories, getProducts, getSettings } from "@/lib/content/repository";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/", title: t.meta.siteTitle, description: t.meta.siteDescription, absoluteTitle: true });
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang, t } = await pageContext(params);
  const [categories, featured, brands, settings] = await Promise.all([
    getCategories(lang),
    getProducts(lang, { featuredOnly: true, limit: 4 }),
    getBrands(lang, { featuredOnly: true }),
    getSettings(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_20%,rgb(126_244_36/0.14),transparent_70%)]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-36 pt-12 text-center sm:pb-48 sm:pt-20">
          <h1 className="sr-only">{t.meta.siteTitle}</h1>
          <Logo className="w-full max-w-[460px] animate-rise" />
          <p className="eyebrow mt-8 text-muted-dark">
            {categories.map((c, i) => (
              <span key={c.slug} className="whitespace-nowrap">
                {i > 0 && <span className="mx-2 text-lime" aria-hidden="true">•</span>}
                {c.name}
              </span>
            ))}
          </p>
          <p className="mt-6 max-w-xl text-base text-muted-dark sm:text-lg">{t.home.heroText}</p>
          <div className="mt-6">
            <OpenNowBadge slots={settings.openingHours} timezone={settings.timezone} locale={lang} labels={t.hours} />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href={localizedPath(lang, "/produits")}>{t.cta.seeProducts}</ButtonLink>
            <ButtonLink href={localizedPath(lang, "/contact")} variant="outline">
              {t.cta.visitUs}
            </ButtonLink>
          </div>
        </div>
        <Waves className="absolute inset-x-0 bottom-0 h-24 w-full sm:h-40" />
      </section>

      {/* CATEGORÍAS */}
      <section className="bg-ink-2 py-16 sm:py-20" aria-labelledby="h-categories">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="h-categories" className="display text-center text-2xl sm:text-3xl">{t.home.categoriesTitle}</h2>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={localizedPath(lang, `/categories/${c.slug}`)}
                  className="group flex h-full flex-col items-center gap-3 rounded-[var(--radius-card)] border border-line-dark bg-ink p-6 text-center transition hover:border-lime hover:shadow-glow"
                >
                  <CategoryIcon icon={c.icon} className="h-16 w-16 transition group-hover:scale-105" />
                  <span className="text-sm font-bold uppercase tracking-wider">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="py-16 sm:py-20" aria-label={t.home.featuredTitle}>
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle
            title={t.home.featuredTitle}
            text={t.home.featuredText}
            action={<ButtonLink href={localizedPath(lang, "/produits")} variant="ghost">{t.cta.seeAll} →</ButtonLink>}
          />
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} locale={lang} demoLabel={t.common.demo} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MARCAS */}
      {brands.length > 0 && (
        <section className="bg-ink-2 py-16 sm:py-20" aria-label={t.home.brandsTitle}>
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle
              title={t.home.brandsTitle}
              action={<ButtonLink href={localizedPath(lang, "/marques")} variant="ghost">{t.cta.seeAll} →</ButtonLink>}
            />
            <ul className="grid gap-4 sm:grid-cols-3">
              {brands.map((b) => (
                <li key={b.slug}>
                  <BrandCard brand={b} locale={lang} cta={t.cta.seeBrand} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* VISITA */}
      <section className="pb-8 pt-16 sm:pt-20" aria-labelledby="h-visit">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
          <div>
            <h2 id="h-visit" className="display text-2xl sm:text-3xl">{t.home.visitTitle}</h2>
            <p className="mt-3 max-w-md text-muted-dark">{t.home.visitText}</p>
            <ContactActions settings={settings} t={t} className="mt-6" />
            <p className="eyebrow mt-10 text-lime">{t.home.areasTitle}</p>
            <p className="mt-2 max-w-md text-sm text-muted-dark">{t.home.areas}</p>
          </div>
          <div className="surface-light rounded-[var(--radius-card)] bg-mist p-6 text-ink sm:p-8">
            <p className="eyebrow text-lime-ink">{t.hours.title}</p>
            <OpeningHours locale={lang} t={t} slots={settings.openingHours} tone="light" className="mt-3" />
          </div>
        </div>
      </section>
    </>
  );
}
