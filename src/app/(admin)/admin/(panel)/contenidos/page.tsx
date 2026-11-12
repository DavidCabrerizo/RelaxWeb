import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminForm, LocaleTabs, SubmitButton, TextArea, TextField } from "@/components/admin/Form";
import { SingleImage } from "@/components/admin/SingleImage";
import { requireStaff } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/supabase/public";
import { ADMIN_LOCALES } from "@/lib/admin/form";
import { LOCALE_LABEL } from "@/lib/admin/i18n";
import { CONTENT_BLOCKS, CONTENT_IMAGES } from "@/lib/content/blocks";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { removeContentImage, saveBlock, setContentImage } from "./actions";

export default function ContentsPage() {
  return (
    <main className="max-w-3xl">
      <AdminHeader title="Contenidos">
        <p className="mt-2 text-sm text-muted-dark">
          Textos e imágenes de la web. Si dejas un campo vacío, se muestra el texto por defecto (en gris como sugerencia).
        </p>
      </AdminHeader>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-ink-3" />}>
        <Editor />
      </Suspense>
    </main>
  );
}

async function Editor() {
  await requireStaff();
  const db = await createClient();
  const { data } = await db.from("page_content").select("key, locale, content");
  const stored = new Map((data ?? []).map((r) => [`${r.key}|${r.locale}`, (r.content ?? {}) as Record<string, string>]));
  const dicts = Object.fromEntries(await Promise.all(ADMIN_LOCALES.map(async (l) => [l, await getDictionary(l)] as const)));

  return (
    <div className="space-y-10">
      <section aria-labelledby="h-images">
        <h2 id="h-images" className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-dark">Imágenes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CONTENT_IMAGES.map((img) => {
            const slot = img.key.replace("images.", "") as "home_hero" | "about";
            return (
              <SingleImage
                key={img.key}
                label={img.label}
                hint={img.hint}
                url={mediaUrl(stored.get(`${img.key}|fr`)?.path)}
                folder="content"
                prefix={`${slot}-`}
                maxSide={2000}
                aspect={slot === "about" ? "aspect-[4/3]" : "aspect-video"}
                onSet={setContentImage.bind(null, slot)}
                onRemove={removeContentImage.bind(null, slot)}
              />
            );
          })}
        </div>
      </section>

      {CONTENT_BLOCKS.map((block) => (
        <section key={block.key} aria-labelledby={`h-${block.key}`}>
          <h2 id={`h-${block.key}`} className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-dark">
            {block.title}
          </h2>
          <AdminForm action={saveBlock}>
            <input type="hidden" name="key" value={block.key} />
            <LocaleTabs
              panels={ADMIN_LOCALES.map((l) => {
                const values = stored.get(`${block.key}|${l}`) ?? {};
                const defaults = block.defaults(dicts[l]);
                return {
                  locale: l,
                  label: LOCALE_LABEL[l],
                  required: true,
                  content: block.fields.map((f) =>
                    f.multiline ? (
                      <TextArea key={f.name} name={`${f.name}_${l}`} label={f.label} defaultValue={values[f.name]} maxLength={f.max} rows={3} hint={`Por defecto: ${defaults[f.name]}`} />
                    ) : (
                      <TextField key={f.name} name={`${f.name}_${l}`} label={f.label} defaultValue={values[f.name]} maxLength={f.max} hint={`Por defecto: ${defaults[f.name]}`} />
                    ),
                  ),
                };
              })}
            />
            <SubmitButton>Guardar</SubmitButton>
          </AdminForm>
        </section>
      ))}
    </div>
  );
}
