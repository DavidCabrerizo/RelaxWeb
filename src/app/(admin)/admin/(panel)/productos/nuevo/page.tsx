import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireStaff } from "@/lib/auth/guard";
import { brandAndCategoryOptions } from "@/lib/admin/options";
import { ProductForm } from "../ProductForm";

export default function NewProductPage() {
  return (
    <main className="max-w-3xl">
      <AdminHeader title="Nuevo producto" back={{ href: "/admin/productos", label: "Productos" }} />
      <Suspense>
        <Guarded />
      </Suspense>
    </main>
  );
}

async function Guarded() {
  await requireStaff();
  const { brands, categories } = await brandAndCategoryOptions();
  if (!brands.length || !categories.length) {
    return <p className="text-muted-dark">Crea al menos una marca y una categoría antes de añadir productos.</p>;
  }
  return <ProductForm brands={brands} categories={categories} />;
}
