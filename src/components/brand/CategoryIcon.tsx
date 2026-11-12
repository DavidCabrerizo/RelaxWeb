/**
 * Iconos de línea dentro de un círculo verde, como en el escaparate.
 * El valor de `icon` se guarda en categories.icon y es elegible desde el admin.
 */
export const CATEGORY_ICONS = ["vape", "cbd", "eliquid", "accessories"] as const;
export type CategoryIconName = (typeof CATEGORY_ICONS)[number];

const glyphs: Record<CategoryIconName, React.ReactNode> = {
  // Vapeador tipo pod
  vape: (
    <>
      <rect x="27" y="22" width="10" height="5" rx="1.5" />
      <rect x="24" y="27" width="16" height="17" rx="3" />
      <path d="M28 33h8M28 37h8" />
    </>
  ),
  // Gota con hoja (CBD)
  cbd: (
    <>
      <path d="M32 18c6 9 11 15 11 21a11 11 0 0 1-22 0c0-6 5-12 11-21Z" />
      <path d="M32 46v-8m0 0c-3-1-5-3-5-6m5 6c3-1 5-3 5-6" />
    </>
  ),
  // Gota con reflejo (e-liquide)
  eliquid: (
    <>
      <path d="M32 18c6 9 11 15 11 21a11 11 0 0 1-22 0c0-6 5-12 11-21Z" />
      <path d="M27 40a5 5 0 0 0 5 5" />
    </>
  ),
  // Engranaje (accessoires)
  accessories: (
    <>
      <circle cx="32" cy="32" r="5" />
      <path d="M32 19v4M32 41v4M19 32h4M41 32h4M22.8 22.8l2.8 2.8M38.4 38.4l2.8 2.8M22.8 41.2l2.8-2.8M38.4 25.6l2.8-2.8" />
      <circle cx="32" cy="32" r="10" />
    </>
  ),
};

type Props = {
  icon: CategoryIconName;
  className?: string;
  tone?: "dark" | "light";
};

export function CategoryIcon({ icon, className, tone = "dark" }: Props) {
  const ring = tone === "dark" ? "var(--color-lime)" : "var(--color-lime-ink)";
  const stroke = tone === "dark" ? "var(--color-paper)" : "var(--color-ink)";
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="29" fill="none" stroke={ring} strokeWidth="3" />
      <g fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {glyphs[icon]}
      </g>
    </svg>
  );
}
