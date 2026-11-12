import type { Metadata } from "next";
import { montserrat } from "@/app/fonts";
import { notFound } from "next/navigation";
import "../../globals.css";
import { HTML_LANG, isLocale } from "@/lib/i18n/config";
import { getEnabledLocales } from "@/lib/site/defaults";


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Relax Sélection — Vape, CBD, e-liquides et accessoires à Genève",
    template: "%s | Relax Sélection Genève",
  },
  description:
    "Boutique multimarque à Genève : vape, CBD, e-liquides et accessoires. Conseils en magasin.",
};

export function generateStaticParams() {
  return getEnabledLocales().map((lang) => ({ lang }));
}

export default async function PublicRootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang) || !getEnabledLocales().includes(lang)) notFound();

  return (
    <html lang={HTML_LANG[lang]} className={`${montserrat.variable} antialiased`}>
      <body className="min-h-dvh bg-ink font-sans text-paper">{children}</body>
    </html>
  );
}
