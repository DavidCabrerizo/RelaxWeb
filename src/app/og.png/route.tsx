import { ImageResponse } from "next/og";

/**
 * Imagen por defecto al compartir la web en redes y mensajería (1200×630), en /og.png.
 * URL fija (sin sufijo aleatorio) para poder usarla también en los datos estructurados.
 * Texto válido en francés e inglés. Las fichas de producto y marca usan su propia foto.
 */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "radial-gradient(circle at 75% 20%, #1f3a10 0%, #111111 55%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", fontSize: 150, fontWeight: 900, letterSpacing: -4 }}>
          <span>REL</span>
          <span style={{ color: "#7EF424" }}>A</span>
          <span>X</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 4 }}>
          <div style={{ width: 90, height: 5, background: "#7EF424", borderRadius: 3 }} />
          <span style={{ fontSize: 44, letterSpacing: 14, fontWeight: 600 }}>SÉLECTION</span>
          <div style={{ width: 90, height: 5, background: "#7EF424", borderRadius: 3 }} />
        </div>
        <div style={{ marginTop: 48, fontSize: 34, color: "#A3A8A0" }}>Vape · CBD · E-liquides · Accessoires</div>
        <div style={{ marginTop: 14, fontSize: 30, color: "#7EF424" }}>Genève</div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 22, background: "#7EF424" }} />
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, immutable" } },
  );
}
