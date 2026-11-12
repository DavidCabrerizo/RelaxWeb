import type { Metadata } from "next";
import { montserrat } from "@/app/fonts";
import "../../globals.css";


export const metadata: Metadata = {
  title: "Administración — Relax Sélection",
  robots: { index: false, follow: false },
};

/** Raíz del panel. Autenticación y control de rol: Fase 3. */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="es" className={`${montserrat.variable} antialiased`}>
      <body className="min-h-dvh bg-ink-2 font-sans text-paper">{children}</body>
    </html>
  );
}
