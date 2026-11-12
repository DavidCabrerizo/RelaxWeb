import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { montserrat } from "@/app/fonts";
import "../../globals.css";
import { HTML_LANG, isLocale, localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getEnabledLocales } from "@/lib/site/defaults";
import { getCategories, getSettings } from "@/lib/content/repository";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AgeGate } from "@/components/legal/AgeGate";
import { CookieBanner } from "@/components/legal/CookieBanner";

export const viewport: Viewport = { themeColor: "#111111", colorScheme: "dark" };

export async function generateStaticParams() {
  return (await getEnabledLocales()).map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: t.meta.siteTitle, template: "%s | Relax Sélection Genève" },
    description: t.meta.siteDescription,
    applicationName: "Relax Sélection",
    formatDetection: { telephone: false },
  };
}

export default async function PublicRootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang) || !(await getEnabledLocales()).includes(lang)) notFound();

  const [t, settings, categories] = await Promise.all([getDictionary(lang), getSettings(), getCategories(lang)]);

  return (
    <html lang={HTML_LANG[lang]} className={`${montserrat.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col bg-ink font-sans text-paper">
        <Header locale={lang} t={t} />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <Footer locale={lang} t={t} settings={settings} categories={categories} />
        <AgeGate labels={t.age} />
        <CookieBanner labels={t.cookies} privacyHref={localizedPath(lang, "/confidentialite")} />
      </body>
    </html>
  );
}
