import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { DemoBadge, ProductCard, ProductMedia } from "@/components/ui/Cards";
import { Breadcrumbs } from "@/components/ui/PageHeader";
import { ContactActions } from "@/components/store/ContactActions";
import { isLocale, localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageContext } from "@/lib/i18n/page";
import { ogVersion, pageMetadata } from "@/lib/seo/metadata";
import { getEnabledLocales } from "@/lib/site/defaults";
import { getAllSlugs, getProduct, getProducts, getSettings, findRedirect } from "@/lib/content/repository";

export async function generateStaticParams() {
  const { products } = await getAllSlugs();
  return (await getEnabledLocales()).flatMap((lang) => products.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/produits/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const p = await getProduct(slug, lang);
  if (!p) return {};
  const t = await getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: `/produits/${p.slug}`,
    title: p.seoTitle || `${p.name} — ${p.brand.name}`,
    description: p.seoDescription || `${p.shortDescription} ${t.catalog.inStore} — Genève.`,
    absoluteTitle: Boolean(p.seoTitle),
    // Foto del producto compuesta a 1200×630 (/og/produit/…); sin foto, el logo de la tienda
    image: p.images[0]
      ? { url: `/og/produit/${p.slug}.jpg?v=${ogVersion(p.updatedAt, p.images[0].url)}`, alt: p.name }
      : undefined,
  });
}

export default async function ProductPage({ params }: PageProps<"/[lang]/produits/[slug]">) {
  const { lang, t } = await pageContext(params);
  const { slug } = await params;
  const product = await getProduct(slug, lang);
  if (!product) {
    // Slug renombrado desde el admin → redirección permanente al nuevo (conserva el SEO)
    const to = await findRedirect("product", slug);
    if (to) permanentRedirect(localizedPath(lang, `/produits/${to}`));
    notFound();
  }

  const [related, settings] = await Promise.all([
    getProducts(lang, { category: product.category.slug }).then((l) => l.filter((p) => p.slug !== product.slug).slice(0, 4)),
    getSettings(),
  ]);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <Breadcrumbs
          locale={lang}
          label={t.common.breadcrumb}
          items={[
            { label: t.common.home, path: "/" },
            { label: t.nav.products, path: "/produits" },
            { label: product.category.name, path: `/categories/${product.category.slug}` },
            { label: product.name },
          ]}
        />
      </div>

      <article className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-2 lg:py-12">
        <div className="group">
          <ProductMedia product={product} priority className="rounded-[var(--radius-card)] border border-line-dark" />
          {product.images.length > 1 && (
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img) => (
                <li key={img.url} className="aspect-square overflow-hidden rounded-xl bg-ink-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} loading="lazy" className="h-full w-full object-cover" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={localizedPath(lang, `/marques/${product.brand.slug}`)} className="eyebrow text-lime hover:underline">
              {product.brand.name}
            </Link>
            {product.isDemo && <DemoBadge label={t.common.demo} />}
          </div>
          <h1 className="display mt-3 text-3xl sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-lg text-paper/85">{product.shortDescription}</p>
          <p className="mt-4 leading-relaxed text-muted-dark">{product.description}</p>

          {product.features.length > 0 && (
            <section className="mt-8" aria-labelledby="h-features">
              <h2 id="h-features" className="eyebrow text-lime">{t.catalog.features}</h2>
              <ul className="mt-3 space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-paper/90">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-line-dark py-4 text-sm">
            <div>
              <dt className="text-muted-dark">{t.catalog.category}</dt>
              <dd className="mt-1 flex items-center gap-2 font-semibold">
                <CategoryIcon icon={product.category.icon} className="h-6 w-6" />
                <Link href={localizedPath(lang, `/categories/${product.category.slug}`)} className="hover:text-lime">
                  {product.category.name}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-muted-dark">{t.catalog.brand}</dt>
              <dd className="mt-1 font-semibold">
                <Link href={localizedPath(lang, `/marques/${product.brand.slug}`)} className="hover:text-lime">
                  {product.brand.name}
                </Link>
              </dd>
            </div>
          </dl>

          <div className="mt-8 rounded-[var(--radius-card)] border border-lime/40 bg-ink-2 p-6">
            <p className="font-bold uppercase tracking-wider text-lime">{t.catalog.inStore}</p>
            <p className="mt-2 text-sm text-muted-dark">{t.catalog.inStoreText}</p>
            <ContactActions settings={settings} t={t} className="mt-5" />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="h-related">
          <h2 id="h-related" className="display text-2xl">{t.catalog.related}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} locale={lang} demoLabel={t.common.demo} morph={false} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
