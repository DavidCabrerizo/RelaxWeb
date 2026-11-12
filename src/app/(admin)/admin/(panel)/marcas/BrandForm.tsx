import { AdminForm, Checkbox, LocaleTabs, NumberField, SlugField, SubmitButton, TextArea, TextField } from "@/components/admin/Form";
import { ADMIN_LOCALES } from "@/lib/admin/form";
import { LOCALE_LABEL, trOf } from "@/lib/admin/i18n";
import type { Tables } from "@/lib/supabase/database.types";
import { saveBrand } from "./actions";

type Brand = Tables<"brands"> & { brand_translations: Tables<"brand_translations">[] };

export function BrandForm({ brand }: { brand?: Brand }) {
  return (
    <AdminForm action={saveBrand}>
      {brand && <input type="hidden" name="id" value={brand.id} />}

      <LocaleTabs
        panels={ADMIN_LOCALES.map((l) => {
          const t = trOf(brand?.brand_translations, l);
          return {
            locale: l,
            label: LOCALE_LABEL[l],
            required: l === "fr",
            content: (
              <>
                <TextField name={`name_${l}`} label="Nombre de la marca" defaultValue={t?.name} required={l === "fr"} maxLength={80} />
                <TextArea name={`description_${l}`} label="Descripción" defaultValue={t?.description} maxLength={2000} rows={4} />
                <TextField name={`seo_title_${l}`} label="Título SEO" defaultValue={t?.seo_title} maxLength={70} recommended={60} hint="Si se deja vacío se genera automáticamente." />
                <TextArea name={`seo_description_${l}`} label="Metadescripción" defaultValue={t?.seo_description} maxLength={170} recommended={155} rows={2} />
              </>
            ),
          };
        })}
      />

      <div className="grid gap-5 rounded-2xl border border-line-dark bg-ink-2 p-5 sm:grid-cols-2">
        <SlugField defaultValue={brand?.slug} prefix="/marques/" />
        <NumberField name="sort_order" label="Orden" defaultValue={brand?.sort_order ?? 0} hint="Menor número = aparece antes." />
        <Checkbox name="is_published" label="Visible en la web" defaultChecked={brand?.is_published ?? true} />
        <Checkbox name="is_featured" label="Marca destacada" hint="Aparece en la página de inicio." defaultChecked={brand?.is_featured} />
      </div>

      {!brand && (
        <div className="rounded-2xl border border-dashed border-line-dark p-5 text-sm text-muted-dark">
          El logotipo y la portada se añaden después de crear la marca.
        </div>
      )}

      <SubmitButton>{brand ? "Guardar cambios" : "Crear marca"}</SubmitButton>
    </AdminForm>
  );
}
