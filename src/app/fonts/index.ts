import localFont from "next/font/local";

/**
 * Montserrat (variable, latin) autoalojada: sin peticiones a Google Fonts
 * (mejor privacidad nLPD y sin dependencia externa en el build).
 */
export const montserrat = localFont({
  // Solo la redonda: la web no usa cursiva y así no se precargan 39 KB extra en cada página
  src: [{ path: "./montserrat-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-montserrat",
  // "optional": si la fuente no ha llegado en ~100 ms, esa visita usa la de sistema (ajustada a las
  // medidas de Montserrat, sin saltos) y la siguiente ya la tiene en caché. Evita repintar todo el texto
  // al llegar la fuente, que es lo que retrasaba el LCP. El logo es vectorial: no depende de la fuente.
  display: "optional",
});
