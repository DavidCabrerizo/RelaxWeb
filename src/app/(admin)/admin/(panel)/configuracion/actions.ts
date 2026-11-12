"use server";

import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { dbErrorMessage, type ActionState } from "@/lib/admin/form";
import { refreshPublicContent } from "@/lib/admin/revalidate";
import { parseSettings } from "@/lib/admin/settings-validate";
import { removeFiles, verifyUploadedImage } from "@/lib/admin/storage";
import { isSiteLogoPath } from "@/lib/media/signature";

/** Solo el rol admin (también lo exige la política RLS de site_settings). */
export async function saveSettings(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff({ adminOnly: true });
  const { values, errors } = parseSettings(form);
  if (Object.keys(errors).length) return { errors, message: "Revisa los campos marcados." };

  const db = await createClient();
  const { error } = await db.from("site_settings").update(values).eq("id", 1);
  if (error) return { message: dbErrorMessage(error) };

  refreshPublicContent();
  return { ok: true, message: "Configuración guardada. La web ya muestra los cambios." };
}

type Result = { ok: boolean; message?: string };
type Variant = "dark" | "light";
const patch = (v: Variant, value: string | null) => (v === "dark" ? { logo_dark_path: value } : { logo_light_path: value });

export async function setSiteLogo(variant: Variant, upload: { path: string }): Promise<Result> {
  await requireStaff({ adminOnly: true });
  if (typeof upload?.path !== "string" || !isSiteLogoPath(upload.path, variant)) return { ok: false, message: "Ruta no válida." };
  const db = await createClient();
  const check = await verifyUploadedImage(db, upload.path);
  if (!check.ok) return { ok: false, message: check.reason };

  const { data: s } = await db.from("site_settings").select("logo_dark_path, logo_light_path").eq("id", 1).maybeSingle();
  const { error } = await db.from("site_settings").update(patch(variant, upload.path)).eq("id", 1);
  if (error) {
    await removeFiles(db, [upload.path]);
    return { ok: false, message: "No se ha podido guardar el logotipo." };
  }
  await removeFiles(db, [variant === "dark" ? s?.logo_dark_path : s?.logo_light_path]);
  refreshPublicContent();
  return { ok: true };
}

export async function removeSiteLogo(variant: Variant): Promise<Result> {
  await requireStaff({ adminOnly: true });
  if (variant !== "dark" && variant !== "light") return { ok: false, message: "Datos no válidos." };
  const db = await createClient();
  const { data: s } = await db.from("site_settings").select("logo_dark_path, logo_light_path").eq("id", 1).maybeSingle();
  const { error } = await db.from("site_settings").update(patch(variant, null)).eq("id", 1);
  if (error) return { ok: false, message: "No se ha podido quitar el logotipo." };
  await removeFiles(db, [variant === "dark" ? s?.logo_dark_path : s?.logo_light_path]);
  refreshPublicContent();
  return { ok: true };
}
