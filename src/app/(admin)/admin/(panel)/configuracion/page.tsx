import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminForm, Checkbox, SubmitButton, TextField } from "@/components/admin/Form";
import { HoursEditor } from "@/components/admin/HoursEditor";
import { SingleImage } from "@/components/admin/SingleImage";
import { SpecialDaysEditor, type SpecialInput } from "@/components/admin/SpecialDaysEditor";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/supabase/public";
import { removeSiteLogo, saveSettings, setSiteLogo } from "./actions";

export default function SettingsPage() {
  return (
    <main className="max-w-3xl">
      <AdminHeader title="Configuración">
        <p className="mt-2 text-sm text-muted-dark">
          Datos de la tienda. Mantén el nombre, la dirección y el teléfono idénticos a la ficha de Google (importante para el SEO local).
        </p>
      </AdminHeader>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-ink-3" />}>
        <Editor />
      </Suspense>
    </main>
  );
}

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-5 rounded-2xl border border-line-dark bg-ink-2 p-5">
    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-dark">{title}</h2>
    {children}
  </section>
);

async function Editor() {
  await requireStaff({ adminOnly: true });
  const db = await createClient();
  const { data: s } = await db.from("site_settings").select("*").eq("id", 1).single();
  if (!s) return <p className="text-muted-dark">No se ha encontrado la configuración.</p>;
  const social = (s.social_links ?? {}) as Record<string, string>;
  const hours = (Array.isArray(s.opening_hours) ? s.opening_hours : []) as { day: number; open: string; close: string }[];
  const special = (Array.isArray(s.special_hours) ? s.special_hours : []) as unknown as SpecialInput[];

  return (
    <div className="space-y-8">
      <Card title="Logotipo">
        <div className="grid gap-4 sm:grid-cols-2">
          <SingleImage
            label="Para fondo oscuro (principal)"
            hint="PNG o WebP con transparencia. Sustituye al logotipo provisional."
            url={mediaUrl(s.logo_dark_path)}
            folder="site"
            prefix="logo-dark-"
            maxSide={1200}
            keepAlpha
            contain
            aspect="aspect-[3/1] bg-ink"
            onSet={setSiteLogo.bind(null, "dark")}
            onRemove={removeSiteLogo.bind(null, "dark")}
          />
          <SingleImage
            label="Para fondo claro"
            hint="Opcional, para documentos o fondos blancos."
            url={mediaUrl(s.logo_light_path)}
            folder="site"
            prefix="logo-light-"
            maxSide={1200}
            keepAlpha
            contain
            aspect="aspect-[3/1] bg-paper"
            onSet={setSiteLogo.bind(null, "light")}
            onRemove={removeSiteLogo.bind(null, "light")}
          />
        </div>
      </Card>

      <AdminForm action={saveSettings}>
        <Card title="Tienda">
          <TextField name="business_name" label="Nombre comercial" defaultValue={s.business_name} required maxLength={80} />
          <TextField name="address_street" label="Calle y número" defaultValue={s.address_street} maxLength={120} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="address_postal_code" label="Código postal" defaultValue={s.address_postal_code} maxLength={10} />
            <TextField name="address_city" label="Localidad" defaultValue={s.address_city} required maxLength={60} />
            <TextField name="latitude" label="Latitud" defaultValue={s.latitude?.toString()} placeholder="46.196782" hint="En Google Maps: mantén pulsado el punto de la tienda." />
            <TextField name="longitude" label="Longitud" defaultValue={s.longitude?.toString()} placeholder="6.146489" />
          </div>
        </Card>

        <Card title="Contacto">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="phone" type="tel" label="Teléfono" defaultValue={s.phone} maxLength={25} placeholder="+41 78 616 20 82" />
            <TextField name="whatsapp" type="tel" label="WhatsApp" defaultValue={s.whatsapp} maxLength={25} hint="Si se rellena, aparece el botón WhatsApp." />
          </div>
          <TextField name="email" type="email" label="Email" defaultValue={s.email} maxLength={254} hint="Visible en la web. Los mensajes del formulario se envían al email configurado en el servidor." />
        </Card>

        <Card title="Google">
          <TextField name="google_maps_url" type="url" label="Enlace de Google Maps" defaultValue={s.google_maps_url} maxLength={500} />
          <TextField name="google_business_url" type="url" label="Enlace de la ficha Google Business Profile" defaultValue={s.google_business_url} maxLength={500} />
        </Card>

        <Card title="Redes sociales">
          <TextField name="social_instagram" type="url" label="Instagram" defaultValue={social.instagram} placeholder="https://www.instagram.com/…" />
          <TextField name="social_facebook" type="url" label="Facebook" defaultValue={social.facebook} placeholder="https://www.facebook.com/…" />
          <TextField name="social_tiktok" type="url" label="TikTok" defaultValue={social.tiktok} placeholder="https://www.tiktok.com/@…" />
        </Card>

        <Card title="Horario semanal">
          <HoursEditor initial={hours} />
        </Card>

        <Card title="Cierres y horarios excepcionales">
          <SpecialDaysEditor initial={special} />
        </Card>

        <Card title="Idiomas">
          <Checkbox name="locale_fr" label="Français (idioma principal, siempre activo)" defaultChecked hint="No se puede desactivar." />
          <Checkbox
            name="locale_en"
            label="English"
            defaultChecked={s.enabled_locales.includes("en")}
            hint="Si se desactiva, las páginas /en dejan de mostrarse y desaparece el selector de idioma."
          />
        </Card>

        <SubmitButton>Guardar configuración</SubmitButton>
      </AdminForm>
    </div>
  );
}
