import { Waves } from "@/components/brand/Waves";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs, PageHeader } from "@/components/ui/PageHeader";
import { isLocale, localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageContext } from "@/lib/i18n/page";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/a-propos">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/a-propos", ...t.meta.about });
}

/** Textos provisionales: en la Fase 6 pasan a editarse desde /admin/contenidos (page_content "about.*"). */
export default async function AboutPage({ params }: PageProps<"/[lang]/a-propos">) {
  const { lang, t } = await pageContext(params);

  return (
    <>
      <PageHeader title={t.about.title} intro={t.about.lead}>
        <Breadcrumbs locale={lang} label={t.common.breadcrumb} items={[{ label: t.common.home, path: "/" }, { label: t.nav.about }]} />
      </PageHeader>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5 text-lg leading-relaxed text-paper/85">
          <p>{t.about.p1}</p>
          <p>{t.about.p2}</p>
          <ButtonLink href={localizedPath(lang, "/contact")} className="mt-4">
            {t.cta.visitUs}
          </ButtonLink>
        </div>
        {/* Hueco para la foto de la tienda (subida desde el admin en la Fase 6) */}
        <div className="relative flex aspect-[4/3] items-end overflow-hidden rounded-[var(--radius-card)] border border-line-dark bg-ink-2">
          <Waves className="h-24 w-full" />
        </div>
      </div>

      <section className="bg-ink-2 py-14" aria-labelledby="h-values">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="h-values" className="display text-2xl sm:text-3xl">{t.about.valuesTitle}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {t.about.values.map((v) => (
              <li key={v.title} className="rounded-[var(--radius-card)] border border-line-dark bg-ink p-6">
                <p className="font-extrabold uppercase tracking-wider text-lime">{v.title}</p>
                <p className="mt-2 text-sm text-muted-dark">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
