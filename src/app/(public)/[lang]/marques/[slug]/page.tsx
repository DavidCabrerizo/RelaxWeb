import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductCard } from "@/components/ui/Cards";
import { Breadcrumbs, PageHeader } from "@/components/ui/PageHeader";
import { isLocale, localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageContext } from "@/lib/i18n/page";
import { pageMetadata } from "@/lib/seo/metadata";
import { getEnabledLocales } from "@/lib/site/defaults";
import { getAllSlugs, getBrand, getProducts, findRedirect } from "@/lib/content/repository";

export async function generateStaticParams() {
  const { brands } = await getAllSlugs();
  return (await getEnabledLocales()).flatMap((lang) => brands.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/marques/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const b = await getBrand(slug, lang);
  if (!b) return {};
  const t = await getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: `/marques/${b.slug}`,
    title: `${b.name} — ${t.nav.brands}`,
    description: (b.description ?? t.meta.brands.description).slice(0, 160),
  });
}

export default async function BrandPage({ params }: PageProps<"/[lang]/marques/[slug]">) {
  const { lang, t } = await pageContext(params);
  const { slug } = await params;
  const brand = await getBrand(slug, lang);
  if (!brand) {
    // Slug renombrado desde el admin → redirección permanente al nuevo (conserva el SEO)
    const to = await findRedirect("brand", slug);
    if (to) permanentRedirect(localizedPath(lang, `/marques/${to}`));
    notFound();
  }
  const products = await getProducts(lang, { brand: brand.slug });

  return (
    <>
      {brand.coverUrl && (
        <div className="relative aspect-[21/9] max-h-[420px] w-full overflow-hidden sm:aspect-[3/1]">
          <Image src={brand.coverUrl} alt="" fill priority sizes="100vw" className="object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        </div>
      )}
      <PageHeader title={brand.name} intro={brand.description}>
        <Breadcrumbs
          locale={lang}
          label={t.common.breadcrumb}
          items={[{ label: t.common.home, path: "/" }, { label: t.nav.brands, path: "/marques" }, { label: brand.name }]}
        />
      </PageHeader>
      <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="h-brand-products">
        <h2 id="h-brand-products" className="display text-2xl">{t.catalog.brandProducts}</h2>
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} locale={lang} demoLabel={t.common.demo} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
