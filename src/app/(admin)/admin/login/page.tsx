import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Acceso al panel — Relax Sélection" };

const NOTICES: Record<string, string> = {
  forbidden: "Esta cuenta no tiene acceso al panel.",
};

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-line-dark bg-ink p-8">
        <Logo className="mx-auto w-44" />
        <h1 className="mt-6 text-center text-lg font-extrabold uppercase tracking-wider">Panel de administración</h1>
        <div className="mt-6">
          <Suspense fallback={<LoginForm />}>
            <LoginWithNotice searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function LoginWithNotice({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  const { error } = await searchParams;
  const key = Array.isArray(error) ? error[0] : error;
  return <LoginForm notice={key ? NOTICES[key] : undefined} />;
}
