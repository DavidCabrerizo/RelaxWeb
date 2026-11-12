import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "editor";
export type StaffSession = { userId: string; email: string; role: StaffRole };

/**
 * Autorización en el SERVIDOR para todo el panel. Se llama desde el layout del panel
 * y debe llamarse también al inicio de cada Server Action que escriba datos (Fase 4).
 *  - getUser() verifica la sesión contra Supabase Auth (no se fía solo de la cookie).
 *  - El rol se lee de profiles (RLS: cada usuario solo ve su propio perfil).
 */
export async function requireStaff(opts: { adminOnly?: boolean } = {}): Promise<StaffSession> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/admin/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  const role = profile?.role;

  if (role !== "admin" && role !== "editor") redirect("/admin/login?error=forbidden");
  if (opts.adminOnly && role !== "admin") redirect("/admin?error=admin-only");

  return { userId: auth.user.id, email: auth.user.email ?? "", role };
}
