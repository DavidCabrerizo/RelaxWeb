import { LegalPage } from "@/components/legal/LegalPage";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageContext } from "@/lib/i18n/page";
import { pageMetadata } from "@/lib/seo/metadata";
import { pick } from "@/lib/content/repository";
import { LEGAL_NOTICE } from "@/lib/content/legal";

export async function generateMetadata({ params }: PageProps<"/[lang]/mentions-legales">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return pageMetadata({ locale: lang, pageKey: "legal", path: "/mentions-legales", ...t.meta.legal });
}

export default async function LegalNoticePage({ params }: PageProps<"/[lang]/mentions-legales">) {
  const { lang, t } = await pageContext(params);
  return <LegalPage locale={lang} t={t} title={t.legal.legalTitle} sections={pick(LEGAL_NOTICE, lang)} />;
}
