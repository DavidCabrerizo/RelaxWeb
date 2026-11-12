import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireStaff } from "@/lib/auth/guard";
import { BrandForm } from "../BrandForm";

export default function NewBrandPage() {
  return (
    <main className="max-w-3xl">
      <AdminHeader title="Nueva marca" back={{ href: "/admin/marcas", label: "Marcas" }} />
      <Suspense>
        <Guarded />
      </Suspense>
    </main>
  );
}

async function Guarded() {
  await requireStaff();
  return <BrandForm />;
}
