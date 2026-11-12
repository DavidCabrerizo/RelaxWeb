import { AdminForm, Checkbox, LocaleTabs, NumberField, SelectField, SlugField, SubmitButton, TextArea, TextField } from "@/components/admin/Form";
import { ADMIN_LOCALES } from "@/lib/admin/form";
import { LOCALE_LABEL, trOf } from "@/lib/admin/i18n";
import type { Tables } from "@/lib/supabase/database.types";
import { saveProduct } from "./actions";

type Product = Tables<"products"> & { product_translations: Tables<"product_translations">[] };
type Option = { value: string; label: string };

const featuresText = (f: unknown) => (Array.isArray(f) ? f.filter((x) => typeof x === "string").join("\n") : "");

export function ProductForm({ product, brands, categories }: { product?: Product; brands: Option[]; categories: Option[] }) {
  return (
    <AdminForm action={saveProduct}>
      {product && <input type="hidden" name="id" value={product.id} />}

      <LocaleTabs
        panels={ADMIN_LOCALES.map((l) => {
          const t = trOf(product?.product_translations, l);
          return {
            locale: l,
            label: LOCALE_LABEL[l],
            required: l === "fr",
            content: (
              <>
                <TextField name={`name_${l}`} label="Nombre del producto" defaultValue={t?.name} required={l === "fr"} maxLength={120} />
                <TextArea
                  name={`short_description_${l}`}
                  label="Descripción corta"
                  defaultValue={t?.short_description}
                  maxLength={300}
                  recommended={160}
                  rows={2}
                  hint={l === "fr" ? "Obligatoria para publicar. Aparece en las tarjetas del catálogo." : undefined}
                />
                <TextArea name={`description_${l}`} label="Descripción completa" defaultValue={t?.description} maxLength={5000} rows={6} />
                <TextArea
                  name={`features_${l}`}
                  label="Características"
                  defaultValue={featuresText(t?.features)}
                  maxLength={3000}
                  rows={4}
                  hint="Una por línea (máx. 20)."
                />
                <TextField name={`seo_title_${l}`} label="Título SEO" defaultValue={t?.seo_title} maxLength={70} recommended={60} hint="Si se deja vacío: «Nombre — Marca»." />
                <TextArea name={`seo_description_${l}`} label="Metadescripción" defaultValue={t?.seo_description} maxLength={170} recommended={155} rows={2} />
                <p className="text-xs text-muted-dark">
                  Recuerda: sin precios ni afirmaciones médicas o terapéuticas (normativa suiza).
                </p>
              </>
            ),
          };
        })}
      />

      <div className="grid gap-5 rounded-2xl border border-line-dark bg-ink-2 p-5 sm:grid-cols-2">
        <SelectField name="category_id" label="Categoría" options={categories} defaultValue={product?.category_id} required placeholder="— Elegir —" />
        <SelectField name="brand_id" label="Marca" options={brands} defaultValue={product?.brand_id} required placeholder="— Elegir —" />
        <SlugField defaultValue={product?.slug} prefix="/produits/" />
        <NumberField name="sort_order" label="Orden" defaultValue={product?.sort_order ?? 0} hint="Menor número = aparece antes en su categoría." />
        <SelectField
          name="status"
          label="Estado"
          options={[
            { value: "draft", label: "Borrador (no visible)" },
            { value: "published", label: "Publicado (visible en la web)" },
          ]}
          defaultValue={product?.status ?? "draft"}
        />
        <Checkbox name="is_featured" label="Producto destacado" hint="Aparece en la página de inicio." defaultChecked={product?.is_featured} />
      </div>

      <div className="rounded-2xl border border-dashed border-line-dark p-5 text-sm text-muted-dark">
        Fotografías del producto: subida, galería, imagen principal y orden llegan en la Fase 5.
      </div>

      <SubmitButton>{product ? "Guardar cambios" : "Crear producto"}</SubmitButton>
    </AdminForm>
  );
}
