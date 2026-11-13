import { ViewTransition } from "react";

/**
 * Transición entre páginas. A diferencia del layout, el template se vuelve a montar en cada
 * navegación, así que React anima la salida de la página anterior y la entrada de la nueva
 * (API View Transitions del navegador; donde no existe, el cambio es instantáneo, como siempre).
 * La cabecera no participa: tiene su propio view-transition-name y se queda quieta.
 * Estilos de las animaciones en globals.css (.page-enter / .page-exit).
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
