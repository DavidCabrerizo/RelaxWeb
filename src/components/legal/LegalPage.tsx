import { Breadcrumbs, PageHeader } from "@/components/ui/PageHeader";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Section = { title: string; body: string[] };

export function LegalPage({ locale, t, title, sections }: { locale: Locale; t: Dictionary; title: string; sections: Section[] }) {
  return (
    <>
      <PageHeader title={title}>
        <Breadcrumbs locale={locale} label={t.common.breadcrumb} items={[{ label: t.common.home, path: "/" }, { label: title }]} />
      </PageHeader>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="rounded-xl border border-lime/40 bg-ink-2 px-4 py-3 text-sm text-lime" role="note">
          {t.legal.draftNotice}
        </p>
        {sections.map((s) => (
          <section key={s.title} className="mt-10">
            <h2 className="text-xl font-extrabold uppercase tracking-wide">{s.title}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-paper/85">{p}</p>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
