import "server-only";
import sharp, { type OverlayOptions, type Sharp } from "sharp";
import { LOGO_ON_DARK, LOGO_ON_LIGHT } from "./logo-svg";

/**
 * Imágenes al compartir (Open Graph) de productos y marcas: 1200×630 en JPEG, el formato
 * que aceptan todas las redes y apps de mensajería (WhatsApp, Facebook, LinkedIn, X, iMessage…).
 * Sin texto dinámico: así no dependen de fuentes instaladas en el servidor.
 */
export const OG = { width: 1200, height: 630 } as const;
const BAR = 12; // franja verde inferior, como en el resto de la marca
const INK = "#111111";
const LIME = "#7ef424";

const svgBuffer = (svg: string) => Buffer.from(svg);

function logoPng(svg: string, width: number) {
  // El SVG del logo es 400×170: se rasteriza al ancho pedido
  return sharp(svgBuffer(svg.replace("<svg ", `<svg width="${width}" height="${Math.round((width * 170) / 400)}" `)))
    .png()
    .toBuffer();
}

function roundedMask(w: number, h: number, r: number) {
  return svgBuffer(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`);
}

async function finish(base: Sharp, layers: OverlayOptions[]) {
  const bar = await sharp({
    create: { width: OG.width, height: BAR, channels: 3, background: LIME },
  })
    .png()
    .toBuffer();
  return base
    .composite([...layers, { input: bar, left: 0, top: OG.height - BAR }])
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

/** Marca de agua: logo de Relax Sélection abajo a la derecha, sobre una píldora para que se lea en cualquier foto. */
async function watermark(onDark: boolean): Promise<OverlayOptions[]> {
  const w = 190;
  const logo = await logoPng(onDark ? LOGO_ON_DARK : LOGO_ON_LIGHT, w);
  const pillW = w + 36;
  const pillH = Math.round((w * 170) / 400) + 24;
  const pill = svgBuffer(
    `<svg width="${pillW}" height="${pillH}"><rect width="${pillW}" height="${pillH}" rx="18" fill="${onDark ? "#111111" : "#ffffff"}" fill-opacity="0.78"/></svg>`,
  );
  const left = OG.width - pillW - 28;
  const top = OG.height - BAR - pillH - 24;
  return [
    { input: pill, left, top },
    { input: logo, left: left + 18, top: top + 12 },
  ];
}

/** Color de las esquinas si el fondo de la foto es liso (foto de catálogo), o null si es una foto real. */
async function flatBackground(photo: Sharp): Promise<[number, number, number] | null> {
  const { data, info } = await photo
    .clone()
    .resize(64, 64, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = (x: number, y: number) => {
    const i = (y * info.width + x) * 3;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const samples: number[][] = [];
  for (const [cx, cy] of [
    [0, 0],
    [60, 0],
    [0, 60],
    [60, 60],
  ])
    for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 4; dx++) samples.push(px(cx + dx, cy + dy));
  const avg = [0, 1, 2].map((c) => samples.reduce((a, p) => a + p[c], 0) / samples.length);
  const flat = samples.every((p) => p.every((v, c) => Math.abs(v - avg[c]) < 14));
  return flat ? (avg.map(Math.round) as [number, number, number]) : null;
}

const lum = ([r, g, b]: readonly number[]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/**
 * Producto (o portada de marca), la foto completa y sin recortar:
 *  - foto de catálogo con fondo liso → el fondo se prolonga con ese mismo color y el producto queda integrado;
 *  - foto real → centrada como tarjeta sobre una versión ampliada, difuminada y oscurecida de sí misma.
 */
export async function photoOg(photo: Buffer): Promise<Buffer> {
  const src = sharp(photo, { failOn: "error" }).rotate(); // respeta la orientación EXIF si la hubiera
  const flat = await flatBackground(src);

  if (flat) {
    const fg = await src
      .clone()
      .resize(1000, OG.height - BAR - 90, { fit: "inside" })
      .flatten({ background: { r: flat[0], g: flat[1], b: flat[2] } })
      .png()
      .toBuffer({ resolveWithObject: true });
    const base = sharp({
      create: {
        width: OG.width,
        height: OG.height,
        channels: 3,
        background: { r: flat[0], g: flat[1], b: flat[2] },
      },
    });
    return finish(base, [
      {
        input: fg.data,
        left: Math.round((OG.width - fg.info.width) / 2),
        top: Math.round((OG.height - BAR - fg.info.height) / 2),
      },
      ...(await watermark(lum(flat) < 0.5)),
    ]);
  }

  const background = sharp(
    await src
      .clone()
      .resize(OG.width, OG.height, { fit: "cover" })
      .blur(40)
      .modulate({ brightness: 0.4, saturation: 0.85 })
      .toBuffer(),
  );
  const fg = await src
    .clone()
    .resize(1040, OG.height - BAR - 70, { fit: "inside" })
    .png()
    .toBuffer({ resolveWithObject: true });
  const { width: fw, height: fh } = fg.info;
  const rounded = await sharp(fg.data)
    .composite([{ input: roundedMask(fw, fh, 22), blend: "dest-in" }])
    .png()
    .toBuffer();
  const shadow = svgBuffer(
    `<svg width="${fw + 60}" height="${fh + 60}"><rect x="30" y="36" width="${fw}" height="${fh}" rx="22" fill="#000" fill-opacity="0.45"/></svg>`,
  );
  const blurredShadow = await sharp(shadow).blur(14).png().toBuffer();

  const left = Math.round((OG.width - fw) / 2);
  const top = Math.round((OG.height - BAR - fh) / 2);
  return finish(background, [
    { input: blurredShadow, left: left - 30, top: top - 30 },
    { input: rounded, left, top },
    ...(await watermark(true)),
  ]);
}

/** Luminosidad media (0–1) de los píxeles visibles de una imagen y si tiene transparencia. */
async function analyse(img: Buffer) {
  const { data, info } = await sharp(img)
    .ensureAlpha()
    .resize(96, 96, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let sum = 0;
  let visible = 0;
  let transparent = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const a = data[i + 3] / 255;
    if (a < 0.1) {
      transparent++;
      continue;
    }
    sum += ((0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255) * a;
    visible += a;
  }
  const total = data.length / info.channels;
  return {
    luminance: visible ? sum / visible : 0,
    hasTransparency: transparent / total > 0.05,
    corner: [data[0], data[1], data[2]] as const,
  };
}

/**
 * Marca: su logo centrado. Fondo blanco para logos oscuros y negro (de la marca) para logos
 * claros; si el logo no tiene transparencia, el fondo continúa el color de su propia esquina.
 */
export async function logoOg(logo: Buffer): Promise<Buffer> {
  const { luminance, hasTransparency, corner } = await analyse(logo);
  const bg = hasTransparency
    ? luminance > 0.62
      ? INK
      : "#ffffff"
    : `#${corner.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  const bgLum = hasTransparency
    ? bg === INK
      ? 0
      : 1
    : (0.2126 * corner[0] + 0.7152 * corner[1] + 0.0722 * corner[2]) / 255;

  // Recorta los márgenes vacíos del logo para que ocupe el espacio de forma uniforme
  let trimmed: Buffer;
  try {
    trimmed = await sharp(logo).trim({ threshold: 10 }).png().toBuffer();
  } catch {
    trimmed = logo; // imagen de un solo color: no hay nada que recortar
  }
  const fitted = await sharp(trimmed).resize(760, 320, { fit: "inside" }).png().toBuffer({ resolveWithObject: true });
  const left = Math.round((OG.width - fitted.info.width) / 2);
  const top = Math.round((OG.height - BAR - 90 - fitted.info.height) / 2) + 10;

  const base = sharp({
    create: { width: OG.width, height: OG.height, channels: 3, background: bg },
  });
  return finish(base, [{ input: fitted.data, left, top }, ...(await watermark(bgLum < 0.5))]);
}
