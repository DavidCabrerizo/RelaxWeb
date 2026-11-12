import { LegalPage } from "@/components/legal/LegalPage";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageContext } from "@/lib/i18n/page";
import { pageMetadata } from "@/lib/seo/metadata";
import { pick } from "@/lib/content/repository";
import { PRIVACY_POLICY } from "@/lib/content/legal";

export async function generateMetadata({ params }: PageProps<"/[lang]/confidentialite">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/confidentialite", ...t.meta.privacy });
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/confidentialite">) {
  const { lang, t } = await pageContext(params);
  return <LegalPage locale={lang} t={t} title={t.legal.privacyTitle} sections={pick(PRIVACY_POLICY, lang)} />;
}
