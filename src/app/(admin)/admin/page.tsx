import { Logo } from "@/components/brand/Logo";

export default function AdminHome() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Logo className="w-48" />
      <h1 className="mt-8 text-2xl font-bold">Panel de administración</h1>
      <p className="mt-2 text-muted-dark">
        Estructura reservada. El acceso con Supabase Auth y el dashboard llegan en las Fases 3 y 4.
      </p>
    </main>
  );
}
