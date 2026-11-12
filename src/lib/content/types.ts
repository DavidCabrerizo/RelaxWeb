import type { Locale } from "@/lib/i18n/config";
import type { CategoryIconName } from "@/components/brand/CategoryIcon";

/** Texto por idioma. El francés es obligatorio; el resto cae al francés si falta. */
export type Localized<T = string> = { fr: T } & Partial<Record<Exclude<Locale, "fr">, T>>;

// ---- Forma "en bruto" (equivale a tabla base + filas *_translations) ----
export type RawCategory = {
  slug: string;
  icon: CategoryIconName;
  sortOrder: number;
  name: Localized;
  description?: Localized;
};

export type RawBrand = {
  slug: string;
  isFeatured: boolean;
  sortOrder: number;
  name: Localized;
  description?: Localized;
  logoUrl?: string;
};

export type RawProduct = {
  slug: string;
  brandSlug: string;
  categorySlug: string;
  isFeatured: boolean;
  sortOrder: number;
  isDemo: boolean;
  name: Localized;
  shortDescription: Localized;
  description: Localized;
  features: Localized<string[]>;
  images: { url: string; alt: Localized }[];
};

// ---- Forma "resuelta" para un idioma (lo que reciben los componentes) ----
export type Category = { slug: string; icon: CategoryIconName; name: string; description?: string };
export type Brand = { slug: string; isFeatured: boolean; name: string; description?: string; logoUrl?: string };
export type Product = {
  slug: string;
  isFeatured: boolean;
  isDemo: boolean;
  name: string;
  shortDescription: string;
  description: string;
  features: string[];
  images: { url: string; alt: string }[];
  brand: Brand;
  category: Category;
};

export type OpeningSlot = { day: number; open: string; close: string }; // day 1 = lunes … 7 = domingo

export type SiteSettings = {
  businessName: string;
  street: string | null;
  postalCode: string | null;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  googleMapsUrl: string | null;
  googleBusinessUrl: string | null;
  openingHours: OpeningSlot[];
  social: Partial<Record<"instagram" | "facebook" | "tiktok", string>>;
  timezone: string;
};
