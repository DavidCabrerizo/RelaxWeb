import { Breadcrumbs, PageHeader } from "@/components/ui/PageHeader";
import { ContactActions } from "@/components/store/ContactActions";
import { OpeningHours } from "@/components/store/OpeningHours";
import { OpenNowBadge } from "@/components/store/OpenNowBadge";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageContext } from "@/lib/i18n/page";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSettings } from "@/lib/content/repository";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/contact", ...t.meta.contact });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang, t } = await pageContext(params);
  const s = await getSettings();
  const address = [s.street, [s.postalCode, s.city].filter(Boolean).join(" ")].filter(Boolean);
  const pending = <span className="text-muted-dark">{t.contact.pending}</span>;

  return (
    <>
      <PageHeader title={t.contact.title} intro={t.contact.intro}>
        <Breadcrumbs locale={lang} label={t.common.breadcrumb} items={[{ label: t.common.home, path: "/" }, { label: t.nav.contact }]} />
      </PageHeader>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
        <div className="space-y-8">
          <address className="not-italic">
            <dl className="space-y-5">
              <div>
                <dt className="eyebrow text-lime">{t.contact.address}</dt>
                <dd className="mt-1 text-lg">
                  {s.businessName}
                  <br />
                  {s.street ? address.map((line) => <span key={line} className="block">{line}</span>) : pending}
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-lime">{t.contact.phone}</dt>
                <dd className="mt-1 text-lg">{s.phone ? <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="hover:text-lime">{s.phone}</a> : pending}</dd>
              </div>
              <div>
                <dt className="eyebrow text-lime">{t.contact.email}</dt>
                <dd className="mt-1 text-lg">{s.email ? <a href={`mailto:${s.email}`} className="hover:text-lime">{s.email}</a> : pending}</dd>
              </div>
            </dl>
          </address>
          <ContactActions settings={s} t={t} />

          <section aria-labelledby="h-form" className="rounded-[var(--radius-card)] border border-line-dark bg-ink-2 p-6">
            <h2 id="h-form" className="font-extrabold uppercase tracking-wider">{t.contact.formTitle}</h2>
            <p className="mt-2 text-sm text-muted-dark">{t.contact.formSoon}</p>
          </section>
        </div>

        <div className="space-y-8">
          <section aria-labelledby="h-hours" className="surface-light rounded-[var(--radius-card)] bg-mist p-6 text-ink sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="h-hours" className="eyebrow text-lime-ink">{t.hours.title}</h2>
              <OpenNowBadge slots={s.openingHours} timezone={s.timezone} locale={lang} labels={t.hours} />
            </div>
            <OpeningHours locale={lang} t={t} slots={s.openingHours} tone="light" className="mt-3" />
          </section>

          <section aria-labelledby="h-map" className="rounded-[var(--radius-card)] border border-line-dark bg-ink-2 p-6">
            <h2 id="h-map" className="font-extrabold uppercase tracking-wider">{t.contact.mapTitle}</h2>
            {/* El mapa incrustado (cargado solo con consentimiento) se integra en la Fase 7 */}
            <p className="mt-2 text-sm text-muted-dark">{s.street ? t.contact.mapConsent : t.contact.mapPending}</p>
          </section>
        </div>
      </div>
    </>
  );
}
