"""
Convierte los textos del logotipo (RELAX y SÉLECTION) en trazos vectoriales a partir de la
fuente Montserrat de la web. Así el logo se dibuja idéntico sin esperar a la fuente (mejor LCP)
y se puede rasterizar en cualquier sitio (favicon, imágenes para redes) sin fuentes instaladas.

Uso:  pip install fonttools brotli && python3 scripts/brand/logo-to-paths.py
Salida: src/components/brand/logo-glyphs.ts
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parents[2]
FONT = ROOT / "src/app/fonts/montserrat-latin-wght-normal.woff2"

def instance(weight):
    f = TTFont(FONT)
    return instantiateVariableFont(f, {"wght": weight}, inplace=False)

def run(font, text, x, baseline, size, spacing):
    """Devuelve (lista de (char, d), ancho total) colocando cada glifo como lo haría <text>."""
    upm = font["head"].unitsPerEm
    s = size / upm
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    hmtx = font["hmtx"]
    out, cx = [], x
    for ch in text:
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, cx, baseline)))
        out.append((ch, pen.getCommands()))
        cx += hmtx[g][0] * s + spacing
    return out, cx - x - spacing

bold = instance(800)
semi = instance(600)

# Mismos parámetros que tenía el <text> del componente Logo
relax, w1 = run(bold, "RELAX", 14, 112, 96, -1)
tag, wt = run(semi, "SÉLECTION", 0, 160, 27, 7)
# text-anchor="middle" en x=200 (el navegador centra incluyendo el último espaciado)
shift = 200 - (wt + 7) / 2
tag, _ = run(semi, "SÉLECTION", shift, 160, 27, 7)

d = {c: p for c, p in relax}
ts = f'''// Generado por scripts/brand/logo-to-paths.py a partir de Montserrat. No editar a mano.
/** "REL" (Montserrat 800, 96px, x=14, línea base 112, espaciado -1) */
export const GLYPHS_REL = "{relax[0][1]} {relax[1][1]} {relax[2][1]}";
/** "A" verde */
export const GLYPH_A = "{relax[3][1]}";
/** "X" */
export const GLYPH_X = "{relax[4][1]}";
/** "SÉLECTION" (Montserrat 600, 27px, centrado en x=200, línea base 160, espaciado 7) */
export const GLYPHS_TAGLINE = "{" ".join(p for _, p in tag)}";
'''
(ROOT / "src/components/brand/logo-glyphs.ts").write_text(ts)
print("RELAX ancho", round(w1, 1), "| SÉLECTION desde x", round(shift, 1))
