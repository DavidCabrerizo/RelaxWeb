import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/ui/Cards";
import { Breadcrumbs, PageHeader } from "@/components/ui/PageHeader";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { fmt } from "@/lib/i18n/format";
import { pageContext } from "@/lib/i18n/page";
import { pageMetadata } from "@/lib/seo/metadata";
import { getBrands, getCategories, getProducts } from "@/lib/content/repository";

export async function generateMetadata({ params }: PageProps<"/[lang]/produits">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  // Las vistas filtradas (?categorie=…) comparten canonical con /produits: sin contenido duplicado.
  return pageMetadata({ locale: lang, pageKey: "products", path: "/produits", ...t.meta.products });
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ProductsPage({ params, searchParams }: PageProps<"/[lang]/produits">) {
  const { lang, t } = await pageContext(params);

  return (
    <>
      <PageHeader title={t.catalog.title} intro={t.catalog.intro}>
        <Breadcrumbs locale={lang} label={t.common.breadcrumb} items={[{ label: t.common.home, path: "/" }, { label: t.nav.products }]} />
      </PageHeader>
      {/* Los filtros dependen de la URL: esta parte se sirve en streaming; el resto es estático */}
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog lang={lang} t={t} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Catalog({
  lang,
  t,
  searchParams,
}: {
  lang: Locale;
  t: Awaited<ReturnType<typeof getDictionary>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [categories, brands] = await Promise.all([getCategories(lang), getBrands(lang)]);

  // Solo se aceptan filtros que existen (evita valores arbitrarios en la URL)
  const category = categories.find((c) => c.slug === one(sp.categorie))?.slug;
  const brand = brands.find((b) => b.slug === one(sp.marque))?.slug;
  const products = await getProducts(lang, { category, brand });

  const href = (next: { categorie?: string; marque?: string }) => {
    const q = new URLSearchParams();
    if (next.categorie) q.set("categorie", next.categorie);
    if (next.marque) q.set("marque", next.marque);
    const s = q.toString();
    return localizedPath(lang, "/produits") + (s ? `?${s}` : "");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-4">
        <FilterRow
          label={t.catalog.filterCategory}
          allLabel={t.catalog.all}
          allHref={href({ marque: brand })}
          active={category}
          options={categories.map((c) => ({ value: c.slug, label: c.name, href: href({ categorie: c.slug, marque: brand }) }))}
        />
        <FilterRow
          label={t.catalog.filterBrand}
          allLabel={t.catalog.all}
          allHref={href({ categorie: category })}
          active={brand}
          options={brands.map((b) => ({ value: b.slug, label: b.name, href: href({ categorie: category, marque: b.slug }) }))}
        />
      </div>

      <p className="mt-8 text-sm text-muted-dark" role="status">
        {fmt(t.catalog.count, { n: products.length })}
      </p>

      {products.length ? (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} locale={lang} demoLabel={t.common.demo} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-[var(--radius-card)] border border-line-dark p-8 text-center text-muted-dark">{t.catalog.empty}</p>
      )}
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10" aria-hidden="true">
      <div className="h-9 w-2/3 animate-pulse rounded-full bg-ink-2" />
      <div className="mt-4 h-9 w-1/2 animate-pulse rounded-full bg-ink-2" />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[4/6] animate-pulse rounded-[var(--radius-card)] bg-ink-2" />
        ))}
      </div>
    </div>
  );
}

function FilterRow({
  label,
  allLabel,
  allHref,
  active,
  options,
}: {
  label: string;
  allLabel: string;
  allHref: string;
  active?: string;
  options: { value: string; label: string; href: string }[];
}) {
  const chip =
    "shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition";
  const on = "border-lime bg-lime text-ink";
  const off = "border-line-dark text-paper/80 hover:border-lime hover:text-lime";
  return (
    <nav aria-label={label} className="flex items-center gap-3">
      <span className="eyebrow hidden w-24 shrink-0 text-muted-dark sm:block">{label}</span>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link href={allHref} scroll={false} aria-current={!active ? "true" : undefined} className={`${chip} ${!active ? on : off}`}>
          {allLabel}
        </Link>
        {options.map((o) => (
          <Link
            key={o.value}
            href={o.href}
            scroll={false}
            aria-current={active === o.value ? "true" : undefined}
            className={`${chip} ${active === o.value ? on : off}`}
          >
            {o.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
