/**
 * Hoja de cáñamo estilizada (7 folíolos), dibujada a mano para la web: icono del menú móvil.
 * Cada folíolo es la misma forma lanceolada, girada sobre la base del tallo y escalada.
 */
const LEAFLETS: [angle: number, scale: number][] = [
  [0, 1],
  [-32, 0.84],
  [32, 0.84],
  [-62, 0.63],
  [62, 0.63],
  [-92, 0.38],
  [92, 0.38],
];
// Folíolo apuntando hacia arriba con la base en (12, 17), borde dentado (generado con una curva seno)
const LEAFLET =
  "M12.00 17.00 L12.28 16.01 L12.50 15.03 L12.91 14.04 L12.98 13.05 L13.39 12.06 L13.28 11.07 L13.63 10.09 L13.36 9.10 L13.57 8.11 L13.19 7.12 L13.25 6.14 L12.85 5.15 L12.76 4.16 L12.40 3.17 L12.22 2.19 L12.00 1.20 L11.78 2.19 L11.60 3.17 L11.24 4.16 L11.15 5.15 L10.75 6.14 L10.81 7.12 L10.43 8.11 L10.64 9.10 L10.37 10.09 L10.72 11.07 L10.61 12.06 L11.02 13.05 L11.09 14.04 L11.50 15.03 L11.72 16.01Z";

export function HempLeaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      {LEAFLETS.map(([a, s]) => (
        <path key={a} d={LEAFLET} transform={`rotate(${a} 12 17) translate(12 17) scale(${s}) translate(-12 -17)`} />
      ))}
      <path d="M12 16.8v4.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
