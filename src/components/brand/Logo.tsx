/**
 * Logotipo Relax Sélection — PLACEHOLDER DEMO (vectorización aproximada).
 * Referencia: docs/brand/logo-referencia.png
 * Geometría calibrada sobre Montserrat 800 a 96px (posiciones medidas con getExtentOfChar):
 *   R 14–84 · E 84–148 · L 148–206 · A 206–277 · X 277–347 · altura de mayúscula ≈ y 45–112
 * Se sustituye por el archivo subido en /admin/configuracion cuando exista.
 */
type Props = {
  variant?: "dark" | "light"; // fondo sobre el que se coloca
  className?: string;
  title?: string;
  showTagline?: boolean; // mostrar "SÉLECTION"
};

export function Logo({ variant = "dark", className, title = "Relax Sélection", showTagline = true }: Props) {
  const base = variant === "dark" ? "var(--color-paper)" : "var(--color-ink)";
  const accent = variant === "dark" ? "var(--color-lime)" : "var(--color-lime-ink)";
  const cut = variant === "dark" ? "var(--color-ink)" : "var(--color-paper)"; // color del "recorte"

  return (
    <svg
      viewBox={showTagline ? "0 0 400 170" : "0 0 400 124"}
      role="img"
      aria-label={title}
      className={className}
      data-demo="logo-placeholder"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>

      {/* Humo que sale de la X */}
      <g fill="none" stroke={base} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M342 48c2-10 0-16-6-20" />
        <path d="M334 30c-8-6-6-20 6-20 2-10 18-12 22-2 10-4 20 6 14 14 10 4 8 18-4 18 0 10-14 12-20 4-6 6-16 2-16-6" />
      </g>

      {/* RELAX: REL blanco, A verde, X blanca */}
      <text
        x="14"
        y="112"
        fontFamily="var(--font-montserrat), Montserrat, Arial, sans-serif"
        fontWeight="800"
        fontSize="96"
        letterSpacing="-1"
      >
        <tspan fill={base}>REL</tspan>
        <tspan fill={accent}>A</tspan>
        <tspan fill={base}>X</tspan>
      </text>

      {/* Trazo "/" de la X en verde */}
      <polygon points="280,112 300,112 346,45 326,45" fill={accent} />

      {/* Hoja dentro de la A (recortada en el color del fondo) */}
      <path d="M229 104c0-14 10-24 24-26-2 14-10 24-24 26Z" fill={cut} />
      <path d="M231 102c6-8 12-13 19-20" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Ola verde que cruza R-E-L y termina en punta de hoja junto a la A */}
      <path
        d="M4 101c30-15 62-15 92-4s60 12 98-3c10-4 24-6 36-5-12 4-21 9-29 15-30 16-67 16-101 4s-60-11-96-7Z"
        fill={accent}
        stroke={cut}
        strokeWidth="3"
        paintOrder="stroke"
      />

      {showTagline && (
        <>
          <rect x="14" y="148" width="60" height="3.5" rx="1.75" fill={accent} />
          <rect x="326" y="148" width="60" height="3.5" rx="1.75" fill={accent} />
          <text
            x="200"
            y="160"
            textAnchor="middle"
            fontFamily="var(--font-montserrat), Montserrat, Arial, sans-serif"
            fontWeight="600"
            fontSize="27"
            letterSpacing="7"
            fill={base}
          >
            SÉLECTION
          </text>
        </>
      )}
    </svg>
  );
}
