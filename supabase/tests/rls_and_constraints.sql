\set ON_ERROR_STOP 0
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema storage to anon, authenticated;
grant execute on all functions in schema auth to anon, authenticated;

-- Usuarios: uno admin, uno registrado sin rol
insert into auth.users (id,email) values
 ('11111111-1111-1111-1111-111111111111','admin@demo'),
 ('22222222-2222-2222-2222-222222222222','intruso@demo');
update public.profiles set role='admin' where id='11111111-1111-1111-1111-111111111111';

-- Datos DEMO como superusuario
insert into public.brands (id,slug,is_published) values ('aaaaaaaa-0000-0000-0000-000000000001','marque-demo',true),('aaaaaaaa-0000-0000-0000-000000000002','marque-cachee',false);
insert into public.products (id,slug,brand_id,category_id,status) select 'bbbbbbbb-0000-0000-0000-000000000001','produit-demo','aaaaaaaa-0000-0000-0000-000000000001',id,'published' from public.categories where slug='vape';
insert into public.products (id,slug,status) values ('bbbbbbbb-0000-0000-0000-000000000002','brouillon-demo','draft');
insert into public.product_translations (product_id,locale,name) values ('bbbbbbbb-0000-0000-0000-000000000001','fr','Produit DEMO'),('bbbbbbbb-0000-0000-0000-000000000002','fr','Brouillon DEMO');

\echo '--- T1 anónimo ve solo lo publicado (esperado productos=1, marcas=1, traducciones=1, categorias=4)'
set role anon;
select (select count(*) from public.products) productos, (select count(*) from public.brands) marcas,
       (select count(*) from public.product_translations) traducciones, (select count(*) from public.categories) categorias;
\echo '--- T2 anónimo no puede escribir (esperado ERROR o 0 filas)'
insert into public.products (slug) values ('hack');
update public.products set slug='hack2';
select count(*) as filas_tras_update_anon from public.products where slug like 'hack%';
reset role;

\echo '--- T3 usuario registrado sin rol: no escribe ni ve borradores'
set role authenticated; set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select count(*) as productos_visibles from public.products;
insert into public.brands (slug) values ('intrusa');
update public.profiles set role='admin' where id='22222222-2222-2222-2222-222222222222';
select role as rol_intruso from public.profiles where id='22222222-2222-2222-2222-222222222222';
insert into storage.objects (bucket_id,name) values ('media','x.jpg');
reset role;

\echo '--- T4 admin: ve todo y escribe'
set role authenticated; set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select count(*) as productos_visibles_admin from public.products;
insert into storage.objects (bucket_id,name) values ('media','ok.webp');
\echo '--- T5 cambio de slug genera redirección; segundo cambio no encadena'
update public.products set slug='produit-renomme' where slug='produit-demo';
update public.products set slug='produit-final' where slug='produit-renomme';
select entity_type, from_slug, to_slug from public.slug_redirects order by from_slug;
\echo '--- T6 borrar marca con productos (esperado ERROR por FK restrict)'
delete from public.brands where slug='marque-demo';
\echo '--- T7 slug inválido (esperado ERROR)'
insert into public.categories (slug) values ('Slug Inválido');
\echo '--- T8 dos imágenes principales (esperado ERROR en la segunda)'
insert into public.product_images (product_id,storage_path,is_primary) values ('bbbbbbbb-0000-0000-0000-000000000001','p/1.webp',true);
insert into public.product_images (product_id,storage_path,is_primary) values ('bbbbbbbb-0000-0000-0000-000000000001','p/2.webp',true);
\echo '--- T9 published_at fijado'
select slug, status, published_at is not null as tiene_fecha from public.products order by slug;
reset role;
