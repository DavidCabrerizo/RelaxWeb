import { BrandCard } from "@/components/ui/Cards";
import { Breadcrumbs, PageHeader } from "@/components/ui/PageHeader";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageContext } from "@/lib/i18n/page";
import { pageMetadata } from "@/lib/seo/metadata";
import { getBrands } from "@/lib/content/repository";

export async function generateMetadata({ params }: PageProps<"/[lang]/marques">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return pageMetadata({ locale: lang, pageKey: "brands", path: "/marques", ...t.meta.brands });
}

export default async function BrandsPage({ params }: PageProps<"/[lang]/marques">) {
  const { lang, t } = await pageContext(params);
  const brands = await getBrands(lang);

  return (
    <>
      <PageHeader title={t.brandsPage.title} intro={t.brandsPage.intro}>
        <Breadcrumbs locale={lang} label={t.common.breadcrumb} items={[{ label: t.common.home, path: "/" }, { label: t.nav.brands }]} />
      </PageHeader>
      <ul className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <li key={b.slug}>
            <BrandCard brand={b} locale={lang} cta={t.cta.seeBrand} />
          </li>
        ))}
      </ul>
    </>
  );
}
