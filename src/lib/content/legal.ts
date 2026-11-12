/**
 * Textos legales PROVISIONALES (plantilla). Deben revisarse y completarse con los datos
 * reales del cliente antes de publicar. Los campos entre [corchetes] son pendientes.
 * No sustituyen el asesoramiento de un jurista.
 */
import type { Localized } from "./types";

type Section = { title: string; body: string[] };

export const LEGAL_NOTICE: Localized<Section[]> = {
  fr: [
    {
      title: "Éditeur du site",
      body: [
        "Relax Sélection — [raison sociale et forme juridique]",
        "[Adresse complète], Genève, Suisse",
        "IDE / UID : [CHE-xxx.xxx.xxx] · E-mail : [adresse e-mail]",
      ],
    },
    { title: "Hébergement", body: ["Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.", "Base de données et images : Supabase ([région du projet])."] },
    {
      title: "Produits",
      body: [
        "Ce site présente des produits à titre informatif. Aucune vente n'est réalisée en ligne.",
        "La vente de produits de vapotage et de produits contenant de la nicotine est interdite aux personnes de moins de 18 ans.",
        "Les produits au CBD proposés respectent la législation suisse (teneur en THC inférieure à 1 %). Aucune propriété thérapeutique ne leur est attribuée.",
      ],
    },
    { title: "Propriété intellectuelle", body: ["Les contenus de ce site (textes, logos, images) sont protégés. Toute reproduction sans autorisation est interdite."] },
  ],
  en: [
    {
      title: "Publisher",
      body: [
        "Relax Sélection — [company name and legal form]",
        "[Full address], Geneva, Switzerland",
        "UID: [CHE-xxx.xxx.xxx] · Email: [email address]",
      ],
    },
    { title: "Hosting", body: ["Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.", "Database and images: Supabase ([project region])."] },
    {
      title: "Products",
      body: [
        "This website presents products for information only. No sales are made online.",
        "The sale of vaping products and nicotine products to people under 18 is prohibited.",
        "The CBD products offered comply with Swiss law (THC content below 1%). No therapeutic properties are claimed.",
      ],
    },
    { title: "Intellectual property", body: ["The content of this website (texts, logos, images) is protected. Reproduction without permission is prohibited."] },
  ],
};

export const PRIVACY_POLICY: Localized<Section[]> = {
  fr: [
    {
      title: "Responsable du traitement",
      body: ["Relax Sélection, [adresse], Genève. Contact : [adresse e-mail]. Cette politique suit la loi fédérale sur la protection des données (nLPD)."],
    },
    {
      title: "Données traitées",
      body: [
        "Formulaire de contact : nom, e-mail et message, transmis par e-mail à la boutique uniquement pour vous répondre. Ils ne sont pas enregistrés dans une base de données du site.",
        "Protection anti-abus du formulaire : une empreinte chiffrée (non réversible) de votre adresse IP est conservée 24 heures au maximum.",
        "Journaux techniques de l'hébergeur (adresse IP, date, page consultée) pour la sécurité du site.",
      ],
    },
    {
      title: "Cookies",
      body: [
        "rs_age : mémorise la confirmation de votre majorité (12 mois). Nécessaire.",
        "rs_consent : mémorise votre choix concernant les contenus tiers (6 mois). Nécessaire.",
        "Google Maps : chargé uniquement si vous l'acceptez ; Google peut alors traiter des données selon sa propre politique.",
      ],
    },
    { title: "Vos droits", body: ["Vous pouvez demander l'accès, la rectification ou la suppression de vos données en écrivant à [adresse e-mail]."] },
  ],
  en: [
    {
      title: "Data controller",
      body: ["Relax Sélection, [address], Geneva. Contact: [email address]. This policy follows the Swiss Federal Act on Data Protection (FADP)."],
    },
    {
      title: "Data processed",
      body: [
        "Contact form: name, email and message, sent by email to the shop only to reply to you. They are not stored in any website database.",
        "Form abuse protection: an encrypted, non-reversible fingerprint of your IP address is kept for 24 hours at most.",
        "Hosting provider technical logs (IP address, date, page visited) for website security.",
      ],
    },
    {
      title: "Cookies",
      body: [
        "rs_age: remembers that you confirmed you are an adult (12 months). Necessary.",
        "rs_consent: remembers your choice about third-party content (6 months). Necessary.",
        "Google Maps: loaded only if you accept; Google may then process data under its own policy.",
      ],
    },
    { title: "Your rights", body: ["You can request access to, correction or deletion of your data by writing to [email address]."] },
  ],
};
