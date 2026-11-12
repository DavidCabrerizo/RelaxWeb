import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireStaff } from "@/lib/auth/guard";
import { CategoryForm } from "../CategoryForm";

export default function NewCategoryPage() {
  return (
    <main className="max-w-3xl">
      <AdminHeader title="Nueva categoría" back={{ href: "/admin/categorias", label: "Categorías" }} />
      <Suspense>
        <Guarded />
      </Suspense>
    </main>
  );
}

async function Guarded() {
  await requireStaff();
  return <CategoryForm />;
}
