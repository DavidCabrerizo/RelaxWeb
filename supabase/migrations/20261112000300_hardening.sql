-- =====================================================================
-- Refuerzo tras revisar los avisos (advisors) de Supabase
-- =====================================================================

-- 1) search_path fijo en las funciones de trigger
alter function public.set_updated_at() set search_path = '';
alter function public.products_set_published_at() set search_path = '';

-- 2) Funciones auxiliares fuera del esquema expuesto por la API (/rest/v1/rpc)
--    Las políticas RLS las referencian por OID, así que siguen funcionando tras moverlas.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

alter function public.is_staff() set schema private;
alter function public.is_admin() set schema private;
revoke all on function private.is_staff(), private.is_admin() from public;
grant execute on function private.is_staff(), private.is_admin() to anon, authenticated;

-- La protección del rol llamaba a public.is_admin() por nombre: se actualiza
create or replace function public.protect_profile_role()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.role is distinct from old.role
     and current_user in ('anon', 'authenticated')
     and not private.is_admin() then
    raise exception 'No autorizado a cambiar el rol';
  end if;
  return new;
end $$;

-- Las funciones de trigger no necesitan ser invocables por nadie
revoke execute on function public.handle_new_user(), public.track_slug_change()
  from public, anon, authenticated;

-- 3) Políticas de escritura separadas por acción (antes "for all", que también
--    se evaluaba en cada SELECT y duplicaba trabajo)
do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('categories',            'staff escribe categorias',             'private.is_staff()'),
      ('category_translations', 'staff escribe traducciones categorias', 'private.is_staff()'),
      ('brands',                'staff escribe marcas',                 'private.is_staff()'),
      ('brand_translations',    'staff escribe traducciones marcas',    'private.is_staff()'),
      ('products',              'staff escribe productos',              'private.is_staff()'),
      ('product_translations',  'staff escribe traducciones productos', 'private.is_staff()'),
      ('product_images',        'staff escribe imagenes',               'private.is_staff()'),
      ('slug_redirects',        'staff gestiona redirecciones',         'private.is_staff()'),
      ('page_content',          'staff escribe contenidos',             'private.is_staff()'),
      ('seo_metadata',          'staff escribe seo',                    'private.is_staff()')
    ) as t(tbl, pol, cond)
  loop
    execute format('drop policy %I on public.%I', r.pol, r.tbl);
    execute format('create policy %I on public.%I for insert to authenticated with check (%s)',
                   'staff inserta ' || r.tbl, r.tbl, r.cond);
    execute format('create policy %I on public.%I for update to authenticated using (%s) with check (%s)',
                   'staff actualiza ' || r.tbl, r.tbl, r.cond, r.cond);
    execute format('create policy %I on public.%I for delete to authenticated using (%s)',
                   'staff borra ' || r.tbl, r.tbl, r.cond);
  end loop;
end $$;

-- 4) Índice para la clave foránea products.category_id
create index if not exists products_category_idx on public.products (category_id);
