"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; email?: string };

const GENERIC = "Correo o contraseña incorrectos.";

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  // Validación en servidor (la del navegador es solo comodidad)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 8 || password.length > 128) {
    return { error: GENERIC, email };
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: "El panel no está configurado (faltan las variables de Supabase).", email };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  // Mensaje genérico: no revela si el correo existe. Supabase Auth aplica límite de intentos.
  if (error || !data.user) return { error: GENERIC, email };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "admin" && profile?.role !== "editor") {
    await supabase.auth.signOut();
    return { error: "Esta cuenta no tiene acceso al panel.", email };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
