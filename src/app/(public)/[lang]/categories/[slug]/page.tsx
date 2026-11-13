import { notFound, permanentRedirect } from "next/navigation";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { ProductCard } from "@/components/ui/Cards";
import { Breadcrumbs, PageHeader } from "@/components/ui/PageHeader";
import { isLocale, localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { fmt } from "@/lib/i18n/format";
import { pageContext } from "@/lib/i18n/page";
import { pageMetadata } from "@/lib/seo/metadata";
import { getEnabledLocales } from "@/lib/site/defaults";
import { getAllSlugs, getCategory, getProducts, findRedirect } from "@/lib/content/repository";

export async function generateStaticParams() {
  const { categories } = await getAllSlugs();
  return (await getEnabledLocales()).flatMap((lang) => categories.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/categories/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const c = await getCategory(slug, lang);
  if (!c) return {};
  const t = await getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: `/categories/${c.slug}`,
    title: c.seoTitle || fmt(t.meta.categoryTitle, { name: c.name }),
    description: c.seoDescription || fmt(t.meta.categoryDescription, { name: c.name }),
    absoluteTitle: Boolean(c.seoTitle),
  });
}

export default async function CategoryPage({ params }: PageProps<"/[lang]/categories/[slug]">) {
  const { lang, t } = await pageContext(params);
  const { slug } = await params;
  const category = await getCategory(slug, lang);
  if (!category) {
    // Slug renombrado desde el admin → redirección permanente al nuevo (conserva el SEO)
    const to = await findRedirect("category", slug);
    if (to) permanentRedirect(localizedPath(lang, `/categories/${to}`));
    notFound();
  }
  const products = await getProducts(lang, { category: category.slug });

  return (
    <>
      <PageHeader title={fmt(t.meta.categoryTitle, { name: category.name })} intro={category.description}>
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs
            locale={lang}
            label={t.common.breadcrumb}
            items={[{ label: t.common.home, path: "/" }, { label: t.nav.products, path: "/produits" }, { label: category.name }]}
          />
          <CategoryIcon icon={category.icon} className="h-12 w-12 shrink-0 sm:h-16 sm:w-16" />
        </div>
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-muted-dark" role="status">{fmt(t.catalog.count, { n: products.length })}</p>
        <h2 className="sr-only">{t.nav.products}</h2>
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <li key={p.slug}>
              <ProductCard product={p} locale={lang} demoLabel={t.common.demo} priority={i < 2} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
