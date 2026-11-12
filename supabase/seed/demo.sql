-- DATOS DEMO (generado por scripts/generate-demo-seed.ts). Borrar con supabase/seed/remove-demo.sql

begin;

insert into public.category_translations (category_id, locale, name, description)
select id, 'fr', 'Vape', 'Pods, kits et cigarettes électroniques pour débuter ou aller plus loin, présentés et expliqués en boutique.' from public.categories where slug = 'vape'
on conflict (category_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.category_translations (category_id, locale, name, description)
select id, 'en', 'Vape', 'Pods, kits and e-cigarettes for beginners and experienced vapers, shown and explained in store.' from public.categories where slug = 'vape'
on conflict (category_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.category_translations (category_id, locale, name, description)
select id, 'fr', 'CBD', 'Produits au CBD conformes à la législation suisse (THC < 1 %). Aucune allégation thérapeutique.' from public.categories where slug = 'cbd'
on conflict (category_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.category_translations (category_id, locale, name, description)
select id, 'en', 'CBD', 'CBD products compliant with Swiss law (THC < 1%). No therapeutic claims.' from public.categories where slug = 'cbd'
on conflict (category_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.category_translations (category_id, locale, name, description)
select id, 'fr', 'E-liquides', 'Un large choix de saveurs et de taux, à découvrir et comparer en boutique.' from public.categories where slug = 'e-liquides'
on conflict (category_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.category_translations (category_id, locale, name, description)
select id, 'en', 'E-liquids', 'A wide choice of flavours and strengths, to discover and compare in store.' from public.categories where slug = 'e-liquides'
on conflict (category_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.category_translations (category_id, locale, name, description)
select id, 'fr', 'Accessoires', 'Résistances, batteries, chargeurs et petits indispensables pour votre matériel.' from public.categories where slug = 'accessoires'
on conflict (category_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.category_translations (category_id, locale, name, description)
select id, 'en', 'Accessories', 'Coils, batteries, chargers and everyday essentials for your device.' from public.categories where slug = 'accessoires'
on conflict (category_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.brands (slug, is_featured, is_published, sort_order) values ('nimbus-demo', true, true, 1) on conflict (slug) do nothing;

insert into public.brand_translations (brand_id, locale, name, description)
select id, 'fr', 'Nimbus (DÉMO)', 'Marque fictive de démonstration : kits et pods au design épuré.' from public.brands where slug = 'nimbus-demo'
on conflict (brand_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.brand_translations (brand_id, locale, name, description)
select id, 'en', 'Nimbus (DEMO)', 'Fictional demo brand: clean-design kits and pods.' from public.brands where slug = 'nimbus-demo'
on conflict (brand_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.brands (slug, is_featured, is_published, sort_order) values ('alpine-leaf-demo', true, true, 2) on conflict (slug) do nothing;

insert into public.brand_translations (brand_id, locale, name, description)
select id, 'fr', 'Alpine Leaf (DÉMO)', 'Marque fictive de démonstration : gamme CBD cultivée en Suisse.' from public.brands where slug = 'alpine-leaf-demo'
on conflict (brand_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.brand_translations (brand_id, locale, name, description)
select id, 'en', 'Alpine Leaf (DEMO)', 'Fictional demo brand: Swiss-grown CBD range.' from public.brands where slug = 'alpine-leaf-demo'
on conflict (brand_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.brands (slug, is_featured, is_published, sort_order) values ('leman-liquids-demo', true, true, 3) on conflict (slug) do nothing;

insert into public.brand_translations (brand_id, locale, name, description)
select id, 'fr', 'Léman Liquids (DÉMO)', 'Marque fictive de démonstration : e-liquides aux saveurs fruitées et gourmandes.' from public.brands where slug = 'leman-liquids-demo'
on conflict (brand_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.brand_translations (brand_id, locale, name, description)
select id, 'en', 'Léman Liquids (DEMO)', 'Fictional demo brand: fruity and dessert e-liquid flavours.' from public.brands where slug = 'leman-liquids-demo'
on conflict (brand_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.brands (slug, is_featured, is_published, sort_order) values ('orbit-gear-demo', false, true, 4) on conflict (slug) do nothing;

insert into public.brand_translations (brand_id, locale, name, description)
select id, 'fr', 'Orbit Gear (DÉMO)', 'Marque fictive de démonstration : accessoires et pièces de rechange.' from public.brands where slug = 'orbit-gear-demo'
on conflict (brand_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.brand_translations (brand_id, locale, name, description)
select id, 'en', 'Orbit Gear (DEMO)', 'Fictional demo brand: accessories and spare parts.' from public.brands where slug = 'orbit-gear-demo'
on conflict (brand_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.products (slug, brand_id, category_id, status, is_featured, sort_order)
select 'kit-pod-compact-demo', b.id, c.id, 'published', true, 1
from public.brands b, public.categories c where b.slug = 'nimbus-demo' and c.slug = 'vape'
on conflict (slug) do nothing;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'fr', 'Kit pod compact', 'Un kit simple et léger, idéal pour débuter.', 'Produit de démonstration. Kit pod au format de poche, avec cartouche rechargeable et tirage réglable. Notre équipe vous explique son fonctionnement en boutique.', '["Cartouche rechargeable","Tirage réglable","Recharge USB-C"]'::jsonb
from public.products where slug = 'kit-pod-compact-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'en', 'Compact pod kit', 'A simple, lightweight kit, ideal for beginners.', 'Demo product. Pocket-size pod kit with refillable cartridge and adjustable airflow. Our team will explain how it works in store.', '["Refillable cartridge","Adjustable airflow","USB-C charging"]'::jsonb
from public.products where slug = 'kit-pod-compact-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.products (slug, brand_id, category_id, status, is_featured, sort_order)
select 'kit-box-polyvalent-demo', b.id, c.id, 'published', false, 2
from public.brands b, public.categories c where b.slug = 'nimbus-demo' and c.slug = 'vape'
on conflict (slug) do nothing;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'fr', 'Kit box polyvalent', 'Puissance réglable et grande autonomie.', 'Produit de démonstration. Box avec écran, puissance réglable et clearomiseur adapté à de nombreux e-liquides.', '["Écran couleur","Puissance réglable","Clearomiseur inclus"]'::jsonb
from public.products where slug = 'kit-box-polyvalent-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'en', 'All-round box kit', 'Adjustable power and long battery life.', 'Demo product. Box mod with screen, adjustable power and a tank suited to many e-liquids.', '["Colour screen","Adjustable power","Tank included"]'::jsonb
from public.products where slug = 'kit-box-polyvalent-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.products (slug, brand_id, category_id, status, is_featured, sort_order)
select 'pod-stylo-demo', b.id, c.id, 'published', false, 3
from public.brands b, public.categories c where b.slug = 'nimbus-demo' and c.slug = 'vape'
on conflict (slug) do nothing;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'fr', 'Pod stylo', 'Format stylo, discret et pratique.', 'Produit de démonstration. Pod au format stylo, à activation automatique.', '["Activation automatique","Format stylo"]'::jsonb
from public.products where slug = 'pod-stylo-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'en', 'Pen-style pod', 'Pen format, discreet and practical.', 'Demo product. Pen-style pod with automatic activation.', '["Automatic activation","Pen format"]'::jsonb
from public.products where slug = 'pod-stylo-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.products (slug, brand_id, category_id, status, is_featured, sort_order)
select 'fleurs-cbd-indoor-demo', b.id, c.id, 'published', true, 1
from public.brands b, public.categories c where b.slug = 'alpine-leaf-demo' and c.slug = 'cbd'
on conflict (slug) do nothing;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'fr', 'Fleurs CBD indoor', 'Fleurs cultivées en intérieur, THC < 1 %.', 'Produit de démonstration. Fleurs de chanvre cultivées en intérieur, conformes à la législation suisse (THC < 1 %). Vente réservée aux personnes majeures.', '["Culture indoor","THC < 1 %","Origine Suisse"]'::jsonb
from public.products where slug = 'fleurs-cbd-indoor-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'en', 'Indoor CBD flowers', 'Indoor-grown flowers, THC < 1%.', 'Demo product. Indoor-grown hemp flowers, compliant with Swiss law (THC < 1%). Sale to adults only.', '["Indoor grown","THC < 1%","Swiss origin"]'::jsonb
from public.products where slug = 'fleurs-cbd-indoor-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.products (slug, brand_id, category_id, status, is_featured, sort_order)
select 'fleurs-cbd-outdoor-demo', b.id, c.id, 'published', false, 2
from public.brands b, public.categories c where b.slug = 'alpine-leaf-demo' and c.slug = 'cbd'
on conflict (slug) do nothing;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'fr', 'Fleurs CBD outdoor', 'Culture en plein air, THC < 1 %.', 'Produit de démonstration. Fleurs de chanvre cultivées en plein air, conformes à la législation suisse.', '["Culture outdoor","THC < 1 %"]'::jsonb
from public.products where slug = 'fleurs-cbd-outdoor-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'en', 'Outdoor CBD flowers', 'Outdoor grown, THC < 1%.', 'Demo product. Outdoor-grown hemp flowers, compliant with Swiss law.', '["Outdoor grown","THC < 1%"]'::jsonb
from public.products where slug = 'fleurs-cbd-outdoor-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.products (slug, brand_id, category_id, status, is_featured, sort_order)
select 'e-liquide-cbd-demo', b.id, c.id, 'published', false, 3
from public.brands b, public.categories c where b.slug = 'alpine-leaf-demo' and c.slug = 'cbd'
on conflict (slug) do nothing;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'fr', 'E-liquide au CBD', 'E-liquide au CBD, sans nicotine.', 'Produit de démonstration. E-liquide au CBD sans nicotine, à utiliser avec un matériel adapté. Demandez conseil en boutique.', '["Sans nicotine","Flacon 10 ml"]'::jsonb
from public.products where slug = 'e-liquide-cbd-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'en', 'CBD e-liquid', 'CBD e-liquid, nicotine-free.', 'Demo product. Nicotine-free CBD e-liquid, to be used with suitable equipment. Ask for advice in store.', '["Nicotine-free","10 ml bottle"]'::jsonb
from public.products where slug = 'e-liquide-cbd-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.products (slug, brand_id, category_id, status, is_featured, sort_order)
select 'e-liquide-fruits-rouges-demo', b.id, c.id, 'published', true, 1
from public.brands b, public.categories c where b.slug = 'leman-liquids-demo' and c.slug = 'e-liquides'
on conflict (slug) do nothing;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'fr', 'E-liquide fruits rouges', 'Saveur fruits rouges, plusieurs taux.', 'Produit de démonstration. Mélange de fruits rouges, disponible en plusieurs taux de nicotine et sans nicotine.', '["Flacon 10 ml","Plusieurs taux"]'::jsonb
from public.products where slug = 'e-liquide-fruits-rouges-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'en', 'Red berries e-liquid', 'Red berry flavour, several strengths.', 'Demo product. Red berry blend, available in several nicotine strengths and nicotine-free.', '["10 ml bottle","Several strengths"]'::jsonb
from public.products where slug = 'e-liquide-fruits-rouges-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.products (slug, brand_id, category_id, status, is_featured, sort_order)
select 'e-liquide-menthe-fraiche-demo', b.id, c.id, 'published', false, 2
from public.brands b, public.categories c where b.slug = 'leman-liquids-demo' and c.slug = 'e-liquides'
on conflict (slug) do nothing;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'fr', 'E-liquide menthe fraîche', 'Une menthe nette et rafraîchissante.', 'Produit de démonstration. Saveur menthe, disponible en plusieurs taux.', '["Flacon 10 ml"]'::jsonb
from public.products where slug = 'e-liquide-menthe-fraiche-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'en', 'Fresh mint e-liquid', 'A clean, refreshing mint.', 'Demo product. Mint flavour, available in several strengths.', '["10 ml bottle"]'::jsonb
from public.products where slug = 'e-liquide-menthe-fraiche-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.products (slug, brand_id, category_id, status, is_featured, sort_order)
select 'e-liquide-gourmand-demo', b.id, c.id, 'published', false, 3
from public.brands b, public.categories c where b.slug = 'leman-liquids-demo' and c.slug = 'e-liquides'
on conflict (slug) do nothing;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'fr', 'E-liquide gourmand', 'Notes de vanille et de caramel.', 'Produit de démonstration. Saveur gourmande aux notes de vanille et de caramel.', '["Flacon 10 ml","Plusieurs taux"]'::jsonb
from public.products where slug = 'e-liquide-gourmand-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'en', 'Dessert e-liquid', 'Vanilla and caramel notes.', 'Demo product. Dessert flavour with vanilla and caramel notes.', '["10 ml bottle","Several strengths"]'::jsonb
from public.products where slug = 'e-liquide-gourmand-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.products (slug, brand_id, category_id, status, is_featured, sort_order)
select 'resistances-pack-demo', b.id, c.id, 'published', true, 1
from public.brands b, public.categories c where b.slug = 'orbit-gear-demo' and c.slug = 'accessoires'
on conflict (slug) do nothing;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'fr', 'Pack de résistances', 'Résistances de rechange compatibles.', 'Produit de démonstration. Pack de résistances de rechange. Vérifiez la compatibilité avec votre matériel en boutique.', '["Pack de 5","Plusieurs valeurs"]'::jsonb
from public.products where slug = 'resistances-pack-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'en', 'Coil pack', 'Compatible replacement coils.', 'Demo product. Pack of replacement coils. Check compatibility with your device in store.', '["Pack of 5","Several resistances"]'::jsonb
from public.products where slug = 'resistances-pack-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.products (slug, brand_id, category_id, status, is_featured, sort_order)
select 'chargeur-accus-demo', b.id, c.id, 'published', false, 2
from public.brands b, public.categories c where b.slug = 'orbit-gear-demo' and c.slug = 'accessoires'
on conflict (slug) do nothing;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'fr', 'Chargeur d''accus', 'Chargeur pour accus rechargeables.', 'Produit de démonstration. Chargeur pour accus, avec indicateur de charge.', '["2 emplacements","Indicateur de charge"]'::jsonb
from public.products where slug = 'chargeur-accus-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'en', 'Battery charger', 'Charger for rechargeable batteries.', 'Demo product. Battery charger with charge indicator.', '["2 bays","Charge indicator"]'::jsonb
from public.products where slug = 'chargeur-accus-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.products (slug, brand_id, category_id, status, is_featured, sort_order)
select 'etui-transport-demo', b.id, c.id, 'published', false, 3
from public.brands b, public.categories c where b.slug = 'orbit-gear-demo' and c.slug = 'accessoires'
on conflict (slug) do nothing;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'fr', 'Étui de transport', 'Pour protéger et ranger votre matériel.', 'Produit de démonstration. Étui rigide avec rangements pour flacons et accessoires.', '["Coque rigide","Rangements intérieurs"]'::jsonb
from public.products where slug = 'etui-transport-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

insert into public.product_translations (product_id, locale, name, short_description, description, features)
select id, 'en', 'Carry case', 'To protect and store your device.', 'Demo product. Hard case with storage for bottles and accessories.', '["Hard shell","Inner storage"]'::jsonb
from public.products where slug = 'etui-transport-demo'
on conflict (product_id, locale) do update set name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, features = excluded.features;

commit;
