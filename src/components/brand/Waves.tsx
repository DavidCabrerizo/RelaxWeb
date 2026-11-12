/**
 * Ondas fluidas verdes y blancas, inspiradas en el vinilo del escaparate.
 * Decorativas: aria-hidden. Se usan como separador de sección y en el hero.
 */
type Props = {
  className?: string;
  flip?: boolean;
};

export function Waves({ className, flip }: Props) {
  return (
    <svg
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 120C240 60 420 200 720 150S1200 30 1440 70v40C1200 80 1000 190 720 196S240 110 0 170Z"
        fill="var(--color-lime)"
      />
      <path
        d="M0 96C260 40 470 170 760 128S1220 10 1440 40v14C1210 30 1000 150 760 150S250 70 0 116Z"
        fill="var(--color-paper)"
        opacity="0.9"
      />
      <path
        d="M0 176C300 120 520 220 820 196S1260 110 1440 130v24C1260 136 1060 214 820 216S300 160 0 200Z"
        fill="var(--color-lime)"
        opacity="0.75"
      />
    </svg>
  );
}
