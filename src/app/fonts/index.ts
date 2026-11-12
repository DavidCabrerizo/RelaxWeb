import localFont from "next/font/local";

/**
 * Montserrat (variable, latin) autoalojada: sin peticiones a Google Fonts
 * (mejor privacidad nLPD y sin dependencia externa en el build).
 */
export const montserrat = localFont({
  src: [
    { path: "./montserrat-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "./montserrat-latin-wght-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-montserrat",
  display: "swap",
});
