"""
Genera los iconos de la web a partir de src/app/icon.svg (vape con humo verde).
Uso: python3 scripts/brand/build-icons.py   (requiere playwright con Chromium y Pillow)
Salida:
  src/app/favicon.ico        16, 32 y 48 px (navegadores antiguos y buscadores)
  src/app/apple-icon.png     180 px, cuadrado sin esquinas (iOS aplica su propia máscara)
  public/icons/icon-192.png, icon-512.png            manifiesto (Android, accesos directos)
  public/icons/icon-maskable-512.png                  versión con margen de seguridad
"""
import io, os
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
svg = (ROOT / "src/app/icon.svg").read_text()
square = svg.replace('rx="14" ', "")                       # fondo sin esquinas redondeadas
inner = svg.split("\n", 1)[1].rsplit("</svg>", 1)[0]       # contenido sin la etiqueta <svg>
maskable = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#111111"/>'
            '<g transform="translate(6.4 6.4) scale(0.8)">' + inner.replace('rx="14" ', "") + "</g></svg>")

def render(markup, size):
    page.set_content(f"<html><body style='margin:0;background:transparent'>{markup.replace('<svg ', f'<svg width=\"{size}\" height=\"{size}\" ', 1)}</body></html>")
    return Image.open(io.BytesIO(page.locator("svg").screenshot(omit_background=True))).convert("RGBA")

os.makedirs(ROOT / "public/icons", exist_ok=True)
with sync_playwright() as p:
    exe = os.environ.get("CHROME_PATH")
    browser = p.chromium.launch(**({"executable_path": exe} if exe else {}))
    page = browser.new_page()
    big = render(svg, 256)
    big.save(ROOT / "src/app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    render(square, 180).save(ROOT / "src/app/apple-icon.png", optimize=True)
    render(svg, 192).save(ROOT / "public/icons/icon-192.png", optimize=True)
    render(svg, 512).save(ROOT / "public/icons/icon-512.png", optimize=True)
    render(maskable, 512).save(ROOT / "public/icons/icon-maskable-512.png", optimize=True)
    browser.close()
print("Iconos generados")
