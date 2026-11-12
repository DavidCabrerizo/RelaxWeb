import Link from "next/link";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";

/** Dashboard: recuentos reales de la base de datos (sin analíticas inventadas). */
export default function AdminDashboard() {
  return (
    <main>
      <h1 className="text-2xl font-extrabold uppercase tracking-tight">Inicio</h1>
      <p className="mt-1 text-sm text-muted-dark">Resumen del contenido de la web.</p>
      <Suspense fallback={<div className="mt-8 h-28 animate-pulse rounded-2xl bg-ink-3" />}>
        <Stats />
      </Suspense>
    </main>
  );
}

async function Stats() {
  await requireStaff(); // cada página revalida el permiso, no solo el layout
  const db = await createClient();
  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);

  const [total, published, drafts, brands, latest] = await Promise.all([
    count(db.from("products").select("*", { count: "exact", head: true })),
    count(db.from("products").select("*", { count: "exact", head: true }).eq("status", "published")),
    count(db.from("products").select("*", { count: "exact", head: true }).eq("status", "draft")),
    count(db.from("brands").select("*", { count: "exact", head: true })),
    db
      .from("products")
      .select("slug, status, updated_at, product_translations(locale, name)")
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const cards = [
    { label: "Productos", value: total },
    { label: "Publicados", value: published },
    { label: "Borradores", value: drafts },
    { label: "Marcas", value: brands },
  ];

  return (
    <>
      <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-line-dark bg-ink p-5">
            <dt className="text-xs font-bold uppercase tracking-wider text-muted-dark">{c.label}</dt>
            <dd className="mt-2 text-3xl font-extrabold text-lime">{c.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/productos/nuevo" className="rounded-full bg-lime px-5 py-3 text-sm font-bold uppercase text-ink">
          + Añadir producto
        </Link>
        <Link href="/admin/marcas/nueva" className="rounded-full border border-lime px-5 py-3 text-sm font-bold uppercase text-lime">
          + Añadir marca
        </Link>
      </div>

      <section className="mt-10" aria-labelledby="h-latest">
        <h2 id="h-latest" className="text-sm font-bold uppercase tracking-wider text-muted-dark">Últimas modificaciones</h2>
        <ul className="mt-3 divide-y divide-line-dark rounded-2xl border border-line-dark bg-ink">
          {(latest.data ?? []).map((p) => {
            const name =
              (p.product_translations as { locale: string; name: string }[]).find((t) => t.locale === "fr")?.name ?? p.slug;
            return (
              <li key={p.slug} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <span className="truncate">{name}</span>
                <span className="flex shrink-0 items-center gap-3 text-xs text-muted-dark">
                  <span className={p.status === "published" ? "text-lime" : ""}>
                    {p.status === "published" ? "Publicado" : "Borrador"}
                  </span>
                  <time dateTime={p.updated_at}>
                    {new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Zurich" }).format(
                      new Date(p.updated_at),
                    )}
                  </time>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
