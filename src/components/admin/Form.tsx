"use client";

import { createContext, useActionState, useContext, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

export type ActionState = { ok?: boolean; message?: string; errors?: Record<string, string> };
type Action = (state: ActionState, form: FormData) => Promise<ActionState>;

const Ctx = createContext<ActionState>({});

/**
 * Formulario del panel: ejecuta una Server Action y reparte sus errores a los campos.
 * La validación real ocurre en el servidor; la del navegador (required, maxLength) es solo ayuda.
 */
export function AdminForm({ action, children, className = "" }: { action: Action; children: React.ReactNode; className?: string }) {
  const [state, formAction] = useActionState(action, {});
  const msgRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.message) msgRef.current?.focus();
  }, [state]);

  return (
    <Ctx.Provider value={state}>
      <form action={formAction} className={`space-y-6 ${className}`}>
        {state.message && (
          <p
            ref={msgRef}
            tabIndex={-1}
            role={state.ok ? "status" : "alert"}
            className={`rounded-xl border px-4 py-3 text-sm outline-none ${
              state.ok ? "border-lime/50 bg-lime/10 text-lime" : "border-red-400/40 bg-red-500/10 text-red-200"
            }`}
          >
            {state.message}
          </p>
        )}
        {children}
      </form>
    </Ctx.Provider>
  );
}

export const useFieldError = (name: string) => useContext(Ctx).errors?.[name];

const inputCls =
  "mt-1 block w-full rounded-xl border bg-ink px-3 py-2.5 text-sm text-paper outline-none transition placeholder:text-paper/30 focus:border-lime aria-[invalid=true]:border-red-400";

function Label({ label, hint, name, children, count }: { label: string; hint?: string; name: string; children: React.ReactNode; count?: React.ReactNode }) {
  const error = useFieldError(name);
  return (
    <div>
      <label htmlFor={name} className="flex items-baseline justify-between gap-2 text-sm font-semibold">
        <span>{label}</span>
        {count}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted-dark">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

/** Contador de caracteres con aviso al acercarse al límite recomendado (SEO). */
function useCounter(defaultValue: string | null | undefined, recommended?: number) {
  const [len, setLen] = useState((defaultValue ?? "").length);
  const node = recommended ? (
    <span className={`text-xs font-normal ${len > recommended ? "text-amber-300" : "text-muted-dark"}`}>
      {len}/{recommended}
    </span>
  ) : null;
  return { node, onInput: (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => setLen(e.currentTarget.value.length) };
}

type TextProps = {
  name: string;
  label: string;
  defaultValue?: string | null;
  required?: boolean;
  maxLength?: number;
  recommended?: number;
  hint?: string;
  placeholder?: string;
  type?: "text" | "email" | "url" | "tel";
};

export function TextField({ name, label, defaultValue, required, maxLength, recommended, hint, placeholder, type = "text" }: TextProps) {
  const error = useFieldError(name);
  const c = useCounter(defaultValue, recommended);
  return (
    <Label label={label + (required ? " *" : "")} hint={hint} name={name} count={c.node}>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        onInput={c.onInput}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${inputCls} border-line-dark`}
      />
    </Label>
  );
}

export function TextArea({ name, label, defaultValue, required, maxLength, recommended, hint, rows = 4 }: TextProps & { rows?: number }) {
  const error = useFieldError(name);
  const c = useCounter(defaultValue, recommended);
  return (
    <Label label={label + (required ? " *" : "")} hint={hint} name={name} count={c.node}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        required={required}
        maxLength={maxLength}
        onInput={c.onInput}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${inputCls} border-line-dark`}
      />
    </Label>
  );
}

export function SelectField({
  name,
  label,
  options,
  defaultValue,
  required,
  placeholder,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  required?: boolean;
  placeholder?: string;
}) {
  const error = useFieldError(name);
  return (
    <Label label={label + (required ? " *" : "")} name={name}>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        aria-invalid={error ? true : undefined}
        className={`${inputCls} border-line-dark`}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Label>
  );
}

export function NumberField({ name, label, defaultValue, hint }: { name: string; label: string; defaultValue?: number; hint?: string }) {
  return (
    <Label label={label} hint={hint} name={name}>
      <input id={name} name={name} type="number" step={1} defaultValue={defaultValue ?? 0} className={`${inputCls} border-line-dark`} />
    </Label>
  );
}

export function Checkbox({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line-dark bg-ink px-4 py-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-5 w-5 accent-[var(--color-lime)]" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block text-xs text-muted-dark">{hint}</span>}
      </span>
    </label>
  );
}

/** Slug con autocompletado desde el nombre en francés mientras el usuario no lo toque. */
export function SlugField({ defaultValue, sourceName = "name_fr", prefix }: { defaultValue?: string | null; sourceName?: string; prefix: string }) {
  const error = useFieldError("slug");
  const [value, setValue] = useState(defaultValue ?? "");
  const [touched, setTouched] = useState(Boolean(defaultValue));

  useEffect(() => {
    if (touched) return;
    const src = document.querySelector<HTMLInputElement>(`[name="${sourceName}"]`);
    if (!src) return;
    const sync = () =>
      setValue(
        src.value
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toLowerCase()
          .replace(/&/g, "-et-")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 120),
      );
    src.addEventListener("input", sync);
    return () => src.removeEventListener("input", sync);
  }, [touched, sourceName]);

  return (
    <Label label="Slug (URL) *" name="slug" hint={`${prefix}${value || "…"}`}>
      <input
        id="slug"
        name="slug"
        value={value}
        onChange={(e) => {
          setTouched(true);
          setValue(e.target.value);
        }}
        required
        maxLength={120}
        pattern="[a-z0-9]+(-[a-z0-9]+)*"
        aria-invalid={error ? true : undefined}
        className={`${inputCls} border-line-dark font-mono`}
      />
    </Label>
  );
}

export function SubmitButton({ children, variant = "primary", name, value }: { children: React.ReactNode; variant?: "primary" | "outline"; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={`min-h-11 rounded-full px-6 text-sm font-bold uppercase tracking-wider transition disabled:opacity-60 ${
        variant === "primary" ? "bg-lime text-ink hover:bg-lime-soft" : "border border-lime text-lime hover:bg-lime hover:text-ink"
      }`}
    >
      {pending ? "Guardando…" : children}
    </button>
  );
}

/** Pestañas FR / EN. Ambos paneles se renderizan (ocultos) para que el formulario envíe todos los idiomas. */
export function LocaleTabs({ panels }: { panels: { locale: string; label: string; content: React.ReactNode; required?: boolean }[] }) {
  const [active, setActive] = useState(panels[0]?.locale);
  return (
    <div className="rounded-2xl border border-line-dark bg-ink-2">
      <div role="tablist" aria-label="Idioma" className="flex gap-1 border-b border-line-dark p-2">
        {panels.map((p) => (
          <button
            key={p.locale}
            type="button"
            role="tab"
            id={`tab-${p.locale}`}
            aria-selected={active === p.locale}
            aria-controls={`panel-${p.locale}`}
            onClick={() => setActive(p.locale)}
            className="rounded-lg px-4 py-2 text-sm font-bold uppercase text-paper/70 aria-selected:bg-lime aria-selected:text-ink"
          >
            {p.label}
            {!p.required && <span className="ml-1 font-normal normal-case opacity-70">(opcional)</span>}
          </button>
        ))}
      </div>
      {panels.map((p) => (
        <div key={p.locale} role="tabpanel" id={`panel-${p.locale}`} aria-labelledby={`tab-${p.locale}`} hidden={active !== p.locale} className="space-y-5 p-5">
          {p.content}
        </div>
      ))}
    </div>
  );
}

/** Botón de borrado con confirmación. */
export function DeleteForm({
  action,
  confirmText,
  disabledReason,
  label = "Eliminar",
}: {
  action: (form: FormData) => Promise<void>;
  confirmText: string;
  disabledReason?: string;
  label?: string;
}) {
  if (disabledReason) {
    return (
      <p className="text-sm text-muted-dark">
        <span className="font-semibold text-paper/80">{label}:</span> {disabledReason}
      </p>
    );
  }
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <DangerButton>{label}</DangerButton>
    </form>
  );
}

function DangerButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-full border border-red-400/60 px-5 text-sm font-bold uppercase tracking-wider text-red-300 transition hover:bg-red-500/15 disabled:opacity-60"
    >
      {pending ? "Eliminando…" : children}
    </button>
  );
}
