-- =====================================================================
-- Relax Sélection — esquema inicial
-- Estrategia multidioma: tablas *_translations (una fila por idioma).
--   · Añadir un idioma = insertar filas, sin cambiar el esquema.
--   · La tabla base guarda lo que no depende del idioma (slug, orden, estado, imágenes).
--   · El slug es único y compartido entre idiomas (URLs /produits/x y /en/produits/x),
--     lo que simplifica redirecciones y hreflang.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create domain public.slug as text
  check (value ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(value) <= 120);

create domain public.locale_code as text
  check (value in ('fr', 'en', 'de', 'it'));

-- ---------------------------------------------------------------------
-- Perfiles y roles
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        text not null default 'none' check (role in ('none', 'editor', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on column public.profiles.role is
  'none = cuenta sin acceso al panel. Solo admin/editor pueden escribir contenido. El rol se asigna a mano en SQL, nunca desde el cliente.';

-- Crea el perfil (sin permisos) al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ¿El usuario actual puede administrar contenido?
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Desde la API (roles anon/authenticated) solo un admin puede cambiar roles.
-- El SQL Editor / service_role sí puede: así se nombra al primer admin.
-- La función NO es security definer a propósito: current_user debe ser el rol que llama.
create or replace function public.protect_profile_role()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.role is distinct from old.role
     and current_user in ('anon', 'authenticated')
     and not public.is_admin() then
    raise exception 'No autorizado a cambiar el rol';
  end if;
  return new;
end $$;

create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_profile_role();
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Categorías
-- ---------------------------------------------------------------------
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  slug          public.slug not null unique,
  icon          text not null default 'vape' check (icon in ('vape', 'cbd', 'eliquid', 'accessories')),
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.category_translations (
  category_id      uuid not null references public.categories (id) on delete cascade,
  locale           public.locale_code not null,
  name             text not null check (char_length(name) between 1 and 80),
  description      text,
  seo_title        text check (char_length(seo_title) <= 70),
  seo_description  text check (char_length(seo_description) <= 170),
  updated_at       timestamptz not null default now(),
  primary key (category_id, locale)
);

-- ---------------------------------------------------------------------
-- Marcas
-- ---------------------------------------------------------------------
create table public.brands (
  id            uuid primary key default gen_random_uuid(),
  slug          public.slug not null unique,
  logo_path     text,
  cover_path    text,
  is_featured   boolean not null default false,
  is_published  boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.brand_translations (
  brand_id         uuid not null references public.brands (id) on delete cascade,
  locale           public.locale_code not null,
  name             text not null check (char_length(name) between 1 and 80),
  description      text,
  seo_title        text check (char_length(seo_title) <= 70),
  seo_description  text check (char_length(seo_description) <= 170),
  logo_alt         text,
  updated_at       timestamptz not null default now(),
  primary key (brand_id, locale)
);

-- ---------------------------------------------------------------------
-- Productos (sin precio: web escaparate)
-- ---------------------------------------------------------------------
create type public.publish_status as enum ('draft', 'published');

create table public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          public.slug not null unique,
  -- ON DELETE RESTRICT: no se puede borrar una marca/categoría con productos asociados
  brand_id      uuid references public.brands (id) on delete restrict,
  category_id   uuid references public.categories (id) on delete restrict,
  status        public.publish_status not null default 'draft',
  is_featured   boolean not null default false,
  sort_order    integer not null default 0,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index products_listing_idx on public.products (status, category_id, sort_order);
create index products_brand_idx on public.products (brand_id);
create index products_featured_idx on public.products (is_featured) where status = 'published';

create table public.product_translations (
  product_id         uuid not null references public.products (id) on delete cascade,
  locale             public.locale_code not null,
  name               text not null check (char_length(name) between 1 and 120),
  short_description  text check (char_length(short_description) <= 300),
  description        text,
  features           jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  seo_title          text check (char_length(seo_title) <= 70),
  seo_description    text check (char_length(seo_description) <= 170),
  updated_at         timestamptz not null default now(),
  primary key (product_id, locale)
);

create table public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  storage_path  text not null unique,
  -- Texto alternativo por idioma: {"fr": "...", "en": "..."}
  alt           jsonb not null default '{}'::jsonb check (jsonb_typeof(alt) = 'object'),
  is_primary    boolean not null default false,
  sort_order    integer not null default 0,
  width         integer,
  height        integer,
  created_at    timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort_order);
-- Como mucho una imagen principal por producto
create unique index product_images_one_primary on public.product_images (product_id) where is_primary;

-- Publicar fija published_at
create or replace function public.products_set_published_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status <> 'published') then
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end $$;

create trigger products_published_at before insert or update on public.products
  for each row execute function public.products_set_published_at();

-- ---------------------------------------------------------------------
-- Redirecciones automáticas al cambiar un slug
-- ---------------------------------------------------------------------
create table public.slug_redirects (
  id           uuid primary key default gen_random_uuid(),
  entity_type  text not null check (entity_type in ('product', 'brand', 'category')),
  from_slug    public.slug not null,
  to_slug      public.slug not null,
  created_at   timestamptz not null default now(),
  unique (entity_type, from_slug),
  check (from_slug <> to_slug)
);

create or replace function public.track_slug_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  kind text := tg_argv[0];
begin
  if new.slug is distinct from old.slug then
    -- Las redirecciones antiguas que apuntaban al slug viejo pasan a apuntar al nuevo (sin cadenas)
    update public.slug_redirects set to_slug = new.slug
      where entity_type = kind and to_slug = old.slug;
    -- Si el nuevo slug era origen de una redirección, se elimina (vuelve a estar en uso)
    delete from public.slug_redirects where entity_type = kind and from_slug = new.slug;
    insert into public.slug_redirects (entity_type, from_slug, to_slug)
      values (kind, old.slug, new.slug)
      on conflict (entity_type, from_slug) do update set to_slug = excluded.to_slug;
  end if;
  return new;
end $$;

create trigger products_slug_redirect after update of slug on public.products
  for each row execute function public.track_slug_change('product');
create trigger brands_slug_redirect after update of slug on public.brands
  for each row execute function public.track_slug_change('brand');
create trigger categories_slug_redirect after update of slug on public.categories
  for each row execute function public.track_slug_change('category');

-- ---------------------------------------------------------------------
-- Configuración de la tienda (fila única)
-- ---------------------------------------------------------------------
create table public.site_settings (
  id                    smallint primary key default 1 check (id = 1),
  business_name         text not null default 'Relax Sélection',
  address_street        text,
  address_postal_code   text,
  address_city          text not null default 'Genève',
  address_country       text not null default 'CH',
  latitude              numeric(9, 6) check (latitude between -90 and 90),
  longitude             numeric(9, 6) check (longitude between -180 and 180),
  phone                 text,
  whatsapp              text,
  email                 text,
  google_maps_url       text check (google_maps_url is null or google_maps_url ~ '^https://'),
  google_business_url   text check (google_business_url is null or google_business_url ~ '^https://'),
  -- [{ "day": 1..7 (lunes=1), "open": "10:00", "close": "19:00" }, ...]  día ausente = cerrado
  opening_hours         jsonb not null default '[]'::jsonb check (jsonb_typeof(opening_hours) = 'array'),
  -- [{ "date": "2026-12-25", "closed": true, "note": "Noël" }]
  special_hours         jsonb not null default '[]'::jsonb check (jsonb_typeof(special_hours) = 'array'),
  social_links          jsonb not null default '{}'::jsonb check (jsonb_typeof(social_links) = 'object'),
  enabled_locales       text[] not null default array['fr'] check ('fr' = any (enabled_locales)),
  logo_dark_path        text,
  logo_light_path       text,
  og_image_path         text,
  index_drafts          boolean not null default false,
  updated_at            timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Contenidos editables y SEO de páginas estáticas
-- ---------------------------------------------------------------------
create table public.page_content (
  key         text not null check (key ~ '^[a-z0-9_.-]+$'),   -- p.ej. home.hero, about.story, footer
  locale      public.locale_code not null,
  content     jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  updated_at  timestamptz not null default now(),
  primary key (key, locale)
);

create table public.seo_metadata (
  page_key       text not null check (page_key ~ '^[a-z0-9_.-]+$'), -- home, products, brands, about, contact…
  locale         public.locale_code not null,
  title          text check (char_length(title) <= 70),
  description    text check (char_length(description) <= 170),
  og_image_path  text,
  noindex        boolean not null default false,
  updated_at     timestamptz not null default now(),
  primary key (page_key, locale)
);

-- updated_at automáticos
do $$
declare t text;
begin
  foreach t in array array[
    'categories', 'category_translations', 'brands', 'brand_translations', 'products',
    'product_translations', 'site_settings', 'page_content', 'seo_metadata'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_updated_at', t);
  end loop;
end $$;

-- =====================================================================
-- Row Level Security
-- Lectura pública: solo lo publicado. Escritura: solo staff (admin/editor).
-- =====================================================================
alter table public.profiles               enable row level security;
alter table public.categories             enable row level security;
alter table public.category_translations  enable row level security;
alter table public.brands                 enable row level security;
alter table public.brand_translations     enable row level security;
alter table public.products               enable row level security;
alter table public.product_translations   enable row level security;
alter table public.product_images         enable row level security;
alter table public.slug_redirects         enable row level security;
alter table public.site_settings          enable row level security;
alter table public.page_content           enable row level security;
alter table public.seo_metadata           enable row level security;

-- Perfiles
create policy "perfil propio o admin" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "admin gestiona perfiles" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Categorías
create policy "lectura categorias publicadas" on public.categories
  for select to anon, authenticated using (is_published or public.is_staff());
create policy "staff escribe categorias" on public.categories
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "lectura traducciones categorias" on public.category_translations
  for select to anon, authenticated using (
    public.is_staff() or exists (
      select 1 from public.categories c where c.id = category_id and c.is_published));
create policy "staff escribe traducciones categorias" on public.category_translations
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Marcas
create policy "lectura marcas publicadas" on public.brands
  for select to anon, authenticated using (is_published or public.is_staff());
create policy "staff escribe marcas" on public.brands
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "lectura traducciones marcas" on public.brand_translations
  for select to anon, authenticated using (
    public.is_staff() or exists (
      select 1 from public.brands b where b.id = brand_id and b.is_published));
create policy "staff escribe traducciones marcas" on public.brand_translations
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Productos
create policy "lectura productos publicados" on public.products
  for select to anon, authenticated using (status = 'published' or public.is_staff());
create policy "staff escribe productos" on public.products
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "lectura traducciones productos" on public.product_translations
  for select to anon, authenticated using (
    public.is_staff() or exists (
      select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy "staff escribe traducciones productos" on public.product_translations
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "lectura imagenes productos publicados" on public.product_images
  for select to anon, authenticated using (
    public.is_staff() or exists (
      select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy "staff escribe imagenes" on public.product_images
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Redirecciones: lectura pública (las necesita la web), escritura vía trigger
create policy "lectura redirecciones" on public.slug_redirects
  for select to anon, authenticated using (true);
create policy "staff gestiona redirecciones" on public.slug_redirects
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Configuración, contenidos y SEO: son públicos por naturaleza
create policy "lectura configuracion" on public.site_settings
  for select to anon, authenticated using (true);
create policy "admin escribe configuracion" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "lectura contenidos" on public.page_content
  for select to anon, authenticated using (true);
create policy "staff escribe contenidos" on public.page_content
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "lectura seo" on public.seo_metadata
  for select to anon, authenticated using (true);
create policy "staff escribe seo" on public.seo_metadata
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- =====================================================================
-- Storage: bucket público de lectura; escritura solo staff.
-- Tipos y tamaño limitados en el propio bucket (validación del servidor de Supabase).
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Sin política SELECT pública: un bucket público sirve sus archivos por URL sin ella,
-- y una política SELECT abierta permitiría además LISTAR todos los archivos.
create policy "media staff lee" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_staff());
create policy "media staff sube" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_staff());
create policy "media staff actualiza" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_staff())
  with check (bucket_id = 'media' and public.is_staff());
create policy "media staff borra" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_staff());
