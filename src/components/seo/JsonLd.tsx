import { serializeJsonLd } from "@/lib/seo/jsonld";

/** Inserta datos estructurados JSON-LD (escapados) en la página. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
