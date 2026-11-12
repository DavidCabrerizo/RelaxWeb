import localFont from "next/font/local";

/**
 * Montserrat (variable, latin) autoalojada: sin peticiones a Google Fonts
 * (mejor privacidad nLPD y sin dependencia externa en el build).
 */
export const montserrat = localFont({
  // Solo la redonda: la web no usa cursiva y así no se precargan 39 KB extra en cada página
  src: [{ path: "./montserrat-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-montserrat",
  display: "swap",
});
