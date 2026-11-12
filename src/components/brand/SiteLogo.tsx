import { Logo } from "./Logo";

/**
 * Logotipo de la web: el archivo subido en /admin/configuracion si existe;
 * si no, el placeholder SVG (DEMO).
 */
export function SiteLogo({
  url,
  className,
  showTagline = true,
  title = "Relax Sélection",
  priority,
}: {
  url?: string;
  className?: string;
  showTagline?: boolean;
  title?: string;
  priority?: boolean;
}) {
  if (url) {
    // <img> y no next/image: el logo puede ser PNG/WebP con proporciones libres y se pinta a su tamaño CSS
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={title} className={`${className ?? ""} object-contain`} fetchPriority={priority ? "high" : undefined} />;
  }
  return <Logo className={className} showTagline={showTagline} title={title} />;
}
