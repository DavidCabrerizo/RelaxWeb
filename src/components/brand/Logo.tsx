/**
 * Logotipo Relax Sélection — PLACEHOLDER DEMO.
 * Recreación vectorial aproximada del logo de la fachada.
 * Se sustituye automáticamente por el archivo subido en /admin/configuracion
 * (site_settings.logo_dark_url / logo_light_url) en cuanto exista.
 */
type Props = {
  variant?: "dark" | "light"; // fondo sobre el que se coloca
  className?: string;
  title?: string;
};

export function Logo({ variant = "dark", className, title = "Relax Sélection" }: Props) {
  const base = variant === "dark" ? "var(--color-paper)" : "var(--color-ink)";
  const accent = variant === "dark" ? "var(--color-lime)" : "var(--color-lime-ink)";

  return (
    <svg
      viewBox="0 0 364 150"
      role="img"
      aria-label={title}
      className={className}
      data-demo="logo-placeholder"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>

      {/* Nube de humo sobre la X */}
      <g fill="none" stroke={base} strokeWidth="5" strokeLinejoin="round">
        <path d="M300 34c-6-14 10-26 22-18 4-12 24-12 28 2 12 0 16 16 6 22 4 12-10 20-20 14-6 8-20 6-22-4-10 2-18-8-14-16Z" />
        <path d="M318 34c4-4 10-4 14 0" strokeLinecap="round" />
      </g>

      {/* Texto principal */}
      <text
        x="8"
        y="96"
        fontFamily="var(--font-montserrat), Montserrat, Arial, sans-serif"
        fontWeight="900"
        fontSize="86"
        letterSpacing="-3"
        fontStyle="italic"
      >
        <tspan fill={base}>REL</tspan>
        <tspan fill={accent}>AX</tspan>
      </text>

      {/* Hoja / trazo que nace bajo "REL" y sube hacia la A */}
      <path
        d="M12 110c62 5 124-1 176-24 9-4 17-10 24-17-4 15-15 28-30 36-52 24-112 22-170 5Z"
        fill={accent}
      />

      {/* SÉLECTION con líneas verdes a ambos lados */}
      <rect x="6" y="128" width="54" height="3" rx="1.5" fill={accent} />
      <rect x="300" y="128" width="54" height="3" rx="1.5" fill={accent} />
      <text
        x="180"
        y="138"
        textAnchor="middle"
        fontFamily="var(--font-montserrat), Montserrat, Arial, sans-serif"
        fontWeight="600"
        fontSize="24"
        letterSpacing="7"
        fill={base}
      >
        SÉLECTION
      </text>
    </svg>
  );
}
