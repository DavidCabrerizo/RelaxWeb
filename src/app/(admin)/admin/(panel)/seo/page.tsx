import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireStaff } from "@/lib/auth/guard";

export default function Page() {
  return (
    <main className="max-w-2xl">
      <AdminHeader title="SEO" />
      <Suspense>
        <Guarded />
      </Suspense>
    </main>
  );
}

async function Guarded() {
  await requireStaff();
  return (
    <p className="rounded-2xl border border-dashed border-line-dark p-6 text-muted-dark">
      Esta sección llega en la Fase 7: metatítulos y descripciones de las páginas fijas, avisos de campos que faltan e indexación.
    </p>
  );
}
