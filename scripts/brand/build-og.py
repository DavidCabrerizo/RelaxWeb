"""
Genera la imagen por defecto al compartir la web (public/og.jpg, 1200×630): el logotipo de
Relax Sélection sobre el negro de la marca, como el rótulo de la tienda.
Uso: npx tsx scripts/brand/export-logo.tsx && python3 scripts/brand/build-og.py
"""
import base64, os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
logo = (ROOT / "public/brand/logo-sobre-oscuro.svg").read_text()
font = base64.b64encode((ROOT / "src/app/fonts/montserrat-latin-wght-normal.woff2").read_bytes()).decode()

html = f"""<!doctype html><html><head><style>
@font-face {{ font-family: M; src: url(data:font/woff2;base64,{font}) format('woff2'); font-weight: 100 900; }}
html, body {{ margin: 0; }}
.card {{ width: 1200px; height: 630px; position: relative; overflow: hidden; font-family: M, sans-serif;
  background: radial-gradient(60% 75% at 50% 42%, #1d3311 0%, #141814 45%, #111111 75%); color: #fff;
  display: flex; flex-direction: column; align-items: center; justify-content: center; }}
.card svg {{ width: 760px; height: auto; margin-top: -10px; }}
.tag {{ margin-top: 30px; font-weight: 700; font-size: 27px; letter-spacing: 5px; color: #f2f2f2; display: flex; gap: 18px; align-items: center; }}
.dot {{ width: 10px; height: 10px; border-radius: 50%; background: #7ef424; }}
.city {{ margin-top: 18px; font-weight: 600; font-size: 22px; letter-spacing: 8px; color: #7ef424; }}
.bar {{ position: absolute; left: 0; right: 0; bottom: 0; height: 12px; background: #7ef424; }}
</style></head><body><div class="card">{logo}
<div class="tag">VAPE<span class="dot"></span>CBD<span class="dot"></span>E-LIQUIDES<span class="dot"></span>ACCESSOIRES</div>
<div class="city">GENÈVE</div><div class="bar"></div></div></body></html>"""

with sync_playwright() as p:
    exe = os.environ.get("CHROME_PATH")
    b = p.chromium.launch(**({"executable_path": exe} if exe else {}))
    page = b.new_page(viewport={"width": 1200, "height": 630})
    page.set_content(html)
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(300)
    tmp = ROOT / "public/og.tmp.png"
    page.locator(".card").screenshot(path=str(tmp))
    b.close()
from PIL import Image
Image.open(tmp).convert("RGB").save(ROOT / "public/og.jpg", quality=90, optimize=True, progressive=True, subsampling=0)
tmp.unlink()
print("public/og.jpg generada (JPEG: WhatsApp no muestra vistas previas de más de ~300 KB)")
