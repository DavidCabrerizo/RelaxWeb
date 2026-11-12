-- Datos base reales (no DEMO): categorías del escaparate y horario de la fachada.
-- Dirección, teléfono, coordenadas y URLs de Google quedan vacíos hasta confirmarlos.

insert into public.site_settings (id, opening_hours)
values (1, '[
  {"day": 1, "open": "10:00", "close": "19:00"},
  {"day": 2, "open": "10:00", "close": "19:00"},
  {"day": 3, "open": "10:00", "close": "19:00"},
  {"day": 4, "open": "10:00", "close": "19:00"},
  {"day": 5, "open": "10:00", "close": "19:00"},
  {"day": 6, "open": "10:00", "close": "19:00"}
]'::jsonb)
on conflict (id) do nothing;

with c as (
  insert into public.categories (slug, icon, sort_order) values
    ('vape', 'vape', 1),
    ('cbd', 'cbd', 2),
    ('e-liquides', 'eliquid', 3),
    ('accessoires', 'accessories', 4)
  on conflict (slug) do nothing
  returning id, slug
)
insert into public.category_translations (category_id, locale, name)
select id, 'fr', case slug
  when 'vape' then 'Vape'
  when 'cbd' then 'CBD'
  when 'e-liquides' then 'E-liquides'
  when 'accessoires' then 'Accessoires'
end
from c;
