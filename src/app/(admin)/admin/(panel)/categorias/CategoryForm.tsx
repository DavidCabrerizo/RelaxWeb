import { AdminForm, Checkbox, LocaleTabs, NumberField, SelectField, SlugField, SubmitButton, TextArea, TextField } from "@/components/admin/Form";
import { ADMIN_LOCALES } from "@/lib/admin/form";
import { LOCALE_LABEL, trOf } from "@/lib/admin/i18n";
import type { Tables } from "@/lib/supabase/database.types";
import { saveCategory } from "./actions";

type Category = Tables<"categories"> & { category_translations: Tables<"category_translations">[] };

const ICONS = [
  { value: "vape", label: "Vapeador (Vape)" },
  { value: "cbd", label: "Gota con hoja (CBD)" },
  { value: "eliquid", label: "Gota (E-liquides)" },
  { value: "accessories", label: "Engranaje (Accessoires)" },
];

export function CategoryForm({ category }: { category?: Category }) {
  return (
    <AdminForm action={saveCategory}>
      {category && <input type="hidden" name="id" value={category.id} />}

      <LocaleTabs
        panels={ADMIN_LOCALES.map((l) => {
          const t = trOf(category?.category_translations, l);
          return {
            locale: l,
            label: LOCALE_LABEL[l],
            required: l === "fr",
            content: (
              <>
                <TextField name={`name_${l}`} label="Nombre" defaultValue={t?.name} required={l === "fr"} maxLength={80} />
                <TextArea name={`description_${l}`} label="Descripción" defaultValue={t?.description} maxLength={2000} rows={3} />
                <TextField
                  name={`seo_title_${l}`}
                  label="Título SEO"
                  defaultValue={t?.seo_title}
                  maxLength={70}
                  recommended={60}
                  hint="Si se deja vacío se genera automáticamente."
                />
                <TextArea name={`seo_description_${l}`} label="Metadescripción" defaultValue={t?.seo_description} maxLength={170} recommended={155} rows={2} />
              </>
            ),
          };
        })}
      />

      <div className="grid gap-5 rounded-2xl border border-line-dark bg-ink-2 p-5 sm:grid-cols-2">
        <SlugField defaultValue={category?.slug} prefix="/categories/" />
        <SelectField name="icon" label="Icono" options={ICONS} defaultValue={category?.icon ?? "vape"} required />
        <NumberField name="sort_order" label="Orden" defaultValue={category?.sort_order ?? 0} hint="Menor número = aparece antes." />
        <Checkbox name="is_published" label="Visible en la web" defaultChecked={category?.is_published ?? true} />
      </div>

      <SubmitButton>{category ? "Guardar cambios" : "Crear categoría"}</SubmitButton>
    </AdminForm>
  );
}
