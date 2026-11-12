import Link from "next/link";

export function AdminHeader({
  title,
  back,
  action,
  children,
}: {
  title: string;
  back?: { href: string; label: string };
  action?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      {back && (
        <Link href={back.href} className="text-xs font-bold uppercase tracking-wider text-muted-dark hover:text-lime">
          ← {back.label}
        </Link>
      )}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">{title}</h1>
        {action && (
          <Link href={action.href} className="rounded-full bg-lime px-5 py-2.5 text-sm font-bold uppercase text-ink hover:bg-lime-soft">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </header>
  );
}

export function Badge({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
        on ? "bg-lime/15 text-lime" : "bg-ink-3 text-muted-dark"
      }`}
    >
      {on ? onLabel : offLabel}
    </span>
  );
}

/** Aviso tras guardar/crear/borrar (parámetro ?ok=…). */
const OK: Record<string, string> = {
  created: "Creado correctamente.",
  saved: "Cambios guardados.",
  deleted: "Eliminado correctamente.",
};
export function OkNotice({ code }: { code?: string | string[] }) {
  const key = Array.isArray(code) ? code[0] : code;
  if (!key || !OK[key]) return null;
  return (
    <p role="status" className="mb-6 rounded-xl border border-lime/50 bg-lime/10 px-4 py-3 text-sm text-lime">
      {OK[key]}
    </p>
  );
}
