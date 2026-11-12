import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo/jsonld";

/** Preguntas frecuentes (acordeón accesible con <details>) + FAQPage en JSON-LD. */
export function Faq({ title, items }: { title: string; items: { q: string; a: string }[] }) {
  return (
    <section aria-labelledby="h-faq" className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={faqJsonLd(items)} />
      <h2 id="h-faq" className="display text-2xl sm:text-3xl">{title}</h2>
      <div className="mt-6 divide-y divide-line-dark rounded-[var(--radius-card)] border border-line-dark bg-ink-2">
        {items.map((it) => (
          <details key={it.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {it.q}
              <span aria-hidden="true" className="text-xl text-lime transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-muted-dark">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
