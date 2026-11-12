import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/Logo";
import { requireStaff } from "@/lib/auth/guard";
import { logout } from "../login/actions";

const NAV = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/contenidos", label: "Contenidos" },
  { href: "/admin/configuracion", label: "Configuración" },
  { href: "/admin/seo", label: "SEO" },
];

/**
 * Todo lo que cuelga de este layout exige sesión + rol admin/editor (comprobado en servidor).
 * La comprobación vive dentro de <Suspense> (requisito de Cache Components) y NO renderiza
 * {children} hasta que el usuario está autorizado.
 */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <AuthorizedShell>{children}</AuthorizedShell>
    </Suspense>
  );
}

async function AuthorizedShell({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line-dark bg-ink lg:min-h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 p-4 lg:block">
          <Link href="/admin" aria-label="Inicio del panel">
            <Logo showTagline={false} className="h-8 w-auto" />
          </Link>
          <form action={logout} className="lg:hidden">
            <button className="text-xs font-bold uppercase text-muted-dark hover:text-lime">Salir</button>
          </form>
        </div>
        <nav aria-label="Panel" className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:px-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-paper/80 hover:bg-ink-3 hover:text-lime"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-line-dark p-4 text-xs text-muted-dark lg:block">
          <p className="truncate">{session.email}</p>
          <p className="mt-1 uppercase tracking-wider text-lime">{session.role}</p>
          <form action={logout} className="mt-3">
            <button className="font-bold uppercase hover:text-lime">Cerrar sesión</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 p-4 sm:p-8">{children}</div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-lime border-t-transparent" />
    </div>
  );
}
