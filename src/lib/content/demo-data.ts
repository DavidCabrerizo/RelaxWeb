/**
 * DATOS DE DEMOSTRACIÓN — ficticios y marcados como DEMO.
 * Marcas y productos inventados: no corresponden a marcas reales.
 * Sin precios, sin afirmaciones médicas ni terapéuticas.
 * En la Fase 3 se sustituyen por lecturas de Supabase con la misma forma (ver repository.ts).
 */
import type { RawBrand, RawCategory, RawProduct, SiteSettings } from "./types";

export const DEMO_CATEGORIES: RawCategory[] = [
  {
    slug: "vape",
    icon: "vape",
    sortOrder: 1,
    name: { fr: "Vape", en: "Vape" },
    description: {
      fr: "Pods, kits et cigarettes électroniques pour débuter ou aller plus loin, présentés et expliqués en boutique.",
      en: "Pods, kits and e-cigarettes for beginners and experienced vapers, shown and explained in store.",
    },
  },
  {
    slug: "cbd",
    icon: "cbd",
    sortOrder: 2,
    name: { fr: "CBD", en: "CBD" },
    description: {
      fr: "Produits au CBD conformes à la législation suisse (THC < 1 %). Aucune allégation thérapeutique.",
      en: "CBD products compliant with Swiss law (THC < 1%). No therapeutic claims.",
    },
  },
  {
    slug: "e-liquides",
    icon: "eliquid",
    sortOrder: 3,
    name: { fr: "E-liquides", en: "E-liquids" },
    description: {
      fr: "Un large choix de saveurs et de taux, à découvrir et comparer en boutique.",
      en: "A wide choice of flavours and strengths, to discover and compare in store.",
    },
  },
  {
    slug: "accessoires",
    icon: "accessories",
    sortOrder: 4,
    name: { fr: "Accessoires", en: "Accessories" },
    description: {
      fr: "Résistances, batteries, chargeurs et petits indispensables pour votre matériel.",
      en: "Coils, batteries, chargers and everyday essentials for your device.",
    },
  },
];

export const DEMO_BRANDS: RawBrand[] = [
  {
    slug: "nimbus-demo",
    isFeatured: true,
    sortOrder: 1,
    name: { fr: "Nimbus (DÉMO)", en: "Nimbus (DEMO)" },
    description: {
      fr: "Marque fictive de démonstration : kits et pods au design épuré.",
      en: "Fictional demo brand: clean-design kits and pods.",
    },
  },
  {
    slug: "alpine-leaf-demo",
    isFeatured: true,
    sortOrder: 2,
    name: { fr: "Alpine Leaf (DÉMO)", en: "Alpine Leaf (DEMO)" },
    description: {
      fr: "Marque fictive de démonstration : gamme CBD cultivée en Suisse.",
      en: "Fictional demo brand: Swiss-grown CBD range.",
    },
  },
  {
    slug: "leman-liquids-demo",
    isFeatured: true,
    sortOrder: 3,
    name: { fr: "Léman Liquids (DÉMO)", en: "Léman Liquids (DEMO)" },
    description: {
      fr: "Marque fictive de démonstration : e-liquides aux saveurs fruitées et gourmandes.",
      en: "Fictional demo brand: fruity and dessert e-liquid flavours.",
    },
  },
  {
    slug: "orbit-gear-demo",
    isFeatured: false,
    sortOrder: 4,
    name: { fr: "Orbit Gear (DÉMO)", en: "Orbit Gear (DEMO)" },
    description: {
      fr: "Marque fictive de démonstration : accessoires et pièces de rechange.",
      en: "Fictional demo brand: accessories and spare parts.",
    },
  },
];

type P = Omit<RawProduct, "isDemo" | "images">;

const products: P[] = [
  // ---- Vape
  {
    slug: "kit-pod-compact-demo",
    brandSlug: "nimbus-demo",
    categorySlug: "vape",
    isFeatured: true,
    sortOrder: 1,
    name: { fr: "Kit pod compact", en: "Compact pod kit" },
    shortDescription: {
      fr: "Un kit simple et léger, idéal pour débuter.",
      en: "A simple, lightweight kit, ideal for beginners.",
    },
    description: {
      fr: "Produit de démonstration. Kit pod au format de poche, avec cartouche rechargeable et tirage réglable. Notre équipe vous explique son fonctionnement en boutique.",
      en: "Demo product. Pocket-size pod kit with refillable cartridge and adjustable airflow. Our team will explain how it works in store.",
    },
    features: {
      fr: ["Cartouche rechargeable", "Tirage réglable", "Recharge USB-C"],
      en: ["Refillable cartridge", "Adjustable airflow", "USB-C charging"],
    },
  },
  {
    slug: "kit-box-polyvalent-demo",
    brandSlug: "nimbus-demo",
    categorySlug: "vape",
    isFeatured: false,
    sortOrder: 2,
    name: { fr: "Kit box polyvalent", en: "All-round box kit" },
    shortDescription: {
      fr: "Puissance réglable et grande autonomie.",
      en: "Adjustable power and long battery life.",
    },
    description: {
      fr: "Produit de démonstration. Box avec écran, puissance réglable et clearomiseur adapté à de nombreux e-liquides.",
      en: "Demo product. Box mod with screen, adjustable power and a tank suited to many e-liquids.",
    },
    features: {
      fr: ["Écran couleur", "Puissance réglable", "Clearomiseur inclus"],
      en: ["Colour screen", "Adjustable power", "Tank included"],
    },
  },
  {
    slug: "pod-stylo-demo",
    brandSlug: "nimbus-demo",
    categorySlug: "vape",
    isFeatured: false,
    sortOrder: 3,
    name: { fr: "Pod stylo", en: "Pen-style pod" },
    shortDescription: { fr: "Format stylo, discret et pratique.", en: "Pen format, discreet and practical." },
    description: {
      fr: "Produit de démonstration. Pod au format stylo, à activation automatique.",
      en: "Demo product. Pen-style pod with automatic activation.",
    },
    features: { fr: ["Activation automatique", "Format stylo"], en: ["Automatic activation", "Pen format"] },
  },
  // ---- CBD
  {
    slug: "fleurs-cbd-indoor-demo",
    brandSlug: "alpine-leaf-demo",
    categorySlug: "cbd",
    isFeatured: true,
    sortOrder: 1,
    name: { fr: "Fleurs CBD indoor", en: "Indoor CBD flowers" },
    shortDescription: {
      fr: "Fleurs cultivées en intérieur, THC < 1 %.",
      en: "Indoor-grown flowers, THC < 1%.",
    },
    description: {
      fr: "Produit de démonstration. Fleurs de chanvre cultivées en intérieur, conformes à la législation suisse (THC < 1 %). Vente réservée aux personnes majeures.",
      en: "Demo product. Indoor-grown hemp flowers, compliant with Swiss law (THC < 1%). Sale to adults only.",
    },
    features: {
      fr: ["Culture indoor", "THC < 1 %", "Origine Suisse"],
      en: ["Indoor grown", "THC < 1%", "Swiss origin"],
    },
  },
  {
    slug: "fleurs-cbd-outdoor-demo",
    brandSlug: "alpine-leaf-demo",
    categorySlug: "cbd",
    isFeatured: false,
    sortOrder: 2,
    name: { fr: "Fleurs CBD outdoor", en: "Outdoor CBD flowers" },
    shortDescription: { fr: "Culture en plein air, THC < 1 %.", en: "Outdoor grown, THC < 1%." },
    description: {
      fr: "Produit de démonstration. Fleurs de chanvre cultivées en plein air, conformes à la législation suisse.",
      en: "Demo product. Outdoor-grown hemp flowers, compliant with Swiss law.",
    },
    features: { fr: ["Culture outdoor", "THC < 1 %"], en: ["Outdoor grown", "THC < 1%"] },
  },
  {
    slug: "e-liquide-cbd-demo",
    brandSlug: "alpine-leaf-demo",
    categorySlug: "cbd",
    isFeatured: false,
    sortOrder: 3,
    name: { fr: "E-liquide au CBD", en: "CBD e-liquid" },
    shortDescription: { fr: "E-liquide au CBD, sans nicotine.", en: "CBD e-liquid, nicotine-free." },
    description: {
      fr: "Produit de démonstration. E-liquide au CBD sans nicotine, à utiliser avec un matériel adapté. Demandez conseil en boutique.",
      en: "Demo product. Nicotine-free CBD e-liquid, to be used with suitable equipment. Ask for advice in store.",
    },
    features: { fr: ["Sans nicotine", "Flacon 10 ml"], en: ["Nicotine-free", "10 ml bottle"] },
  },
  // ---- E-liquides
  {
    slug: "e-liquide-fruits-rouges-demo",
    brandSlug: "leman-liquids-demo",
    categorySlug: "e-liquides",
    isFeatured: true,
    sortOrder: 1,
    name: { fr: "E-liquide fruits rouges", en: "Red berries e-liquid" },
    shortDescription: { fr: "Saveur fruits rouges, plusieurs taux.", en: "Red berry flavour, several strengths." },
    description: {
      fr: "Produit de démonstration. Mélange de fruits rouges, disponible en plusieurs taux de nicotine et sans nicotine.",
      en: "Demo product. Red berry blend, available in several nicotine strengths and nicotine-free.",
    },
    features: { fr: ["Flacon 10 ml", "Plusieurs taux"], en: ["10 ml bottle", "Several strengths"] },
  },
  {
    slug: "e-liquide-menthe-fraiche-demo",
    brandSlug: "leman-liquids-demo",
    categorySlug: "e-liquides",
    isFeatured: false,
    sortOrder: 2,
    name: { fr: "E-liquide menthe fraîche", en: "Fresh mint e-liquid" },
    shortDescription: { fr: "Une menthe nette et rafraîchissante.", en: "A clean, refreshing mint." },
    description: {
      fr: "Produit de démonstration. Saveur menthe, disponible en plusieurs taux.",
      en: "Demo product. Mint flavour, available in several strengths.",
    },
    features: { fr: ["Flacon 10 ml"], en: ["10 ml bottle"] },
  },
  {
    slug: "e-liquide-gourmand-demo",
    brandSlug: "leman-liquids-demo",
    categorySlug: "e-liquides",
    isFeatured: false,
    sortOrder: 3,
    name: { fr: "E-liquide gourmand", en: "Dessert e-liquid" },
    shortDescription: { fr: "Notes de vanille et de caramel.", en: "Vanilla and caramel notes." },
    description: {
      fr: "Produit de démonstration. Saveur gourmande aux notes de vanille et de caramel.",
      en: "Demo product. Dessert flavour with vanilla and caramel notes.",
    },
    features: { fr: ["Flacon 10 ml", "Plusieurs taux"], en: ["10 ml bottle", "Several strengths"] },
  },
  // ---- Accessoires
  {
    slug: "resistances-pack-demo",
    brandSlug: "orbit-gear-demo",
    categorySlug: "accessoires",
    isFeatured: true,
    sortOrder: 1,
    name: { fr: "Pack de résistances", en: "Coil pack" },
    shortDescription: { fr: "Résistances de rechange compatibles.", en: "Compatible replacement coils." },
    description: {
      fr: "Produit de démonstration. Pack de résistances de rechange. Vérifiez la compatibilité avec votre matériel en boutique.",
      en: "Demo product. Pack of replacement coils. Check compatibility with your device in store.",
    },
    features: { fr: ["Pack de 5", "Plusieurs valeurs"], en: ["Pack of 5", "Several resistances"] },
  },
  {
    slug: "chargeur-accus-demo",
    brandSlug: "orbit-gear-demo",
    categorySlug: "accessoires",
    isFeatured: false,
    sortOrder: 2,
    name: { fr: "Chargeur d'accus", en: "Battery charger" },
    shortDescription: { fr: "Chargeur pour accus rechargeables.", en: "Charger for rechargeable batteries." },
    description: {
      fr: "Produit de démonstration. Chargeur pour accus, avec indicateur de charge.",
      en: "Demo product. Battery charger with charge indicator.",
    },
    features: { fr: ["2 emplacements", "Indicateur de charge"], en: ["2 bays", "Charge indicator"] },
  },
  {
    slug: "etui-transport-demo",
    brandSlug: "orbit-gear-demo",
    categorySlug: "accessoires",
    isFeatured: false,
    sortOrder: 3,
    name: { fr: "Étui de transport", en: "Carry case" },
    shortDescription: { fr: "Pour protéger et ranger votre matériel.", en: "To protect and store your device." },
    description: {
      fr: "Produit de démonstration. Étui rigide avec rangements pour flacons et accessoires.",
      en: "Demo product. Hard case with storage for bottles and accessories.",
    },
    features: { fr: ["Coque rigide", "Rangements intérieurs"], en: ["Hard shell", "Inner storage"] },
  },
];

export const DEMO_PRODUCTS: RawProduct[] = products.map((p) => ({ ...p, isDemo: true, images: [] }));

/**
 * Datos reales de la tienda (ficha de Google Maps facilitada por el cliente) y horario de la fachada.
 * Teléfono y coordenadas: pendientes de confirmar (no se inventan).
 */
export const DEMO_SETTINGS: SiteSettings = {
  businessName: "Relax Sélection",
  street: "Boulevard des Philosophes 23",
  postalCode: "1205",
  city: "Genève",
  country: "CH",
  latitude: null,
  longitude: null,
  phone: null,
  whatsapp: null,
  email: null,
  googleMapsUrl: "https://maps.app.goo.gl/aXxZpkXfjxKGr4JWA",
  googleBusinessUrl: "https://maps.app.goo.gl/aXxZpkXfjxKGr4JWA",
  openingHours: [1, 2, 3, 4, 5, 6].map((day) => ({ day, open: "10:00", close: "19:00" })),
  social: {},
  timezone: "Europe/Zurich",
};
