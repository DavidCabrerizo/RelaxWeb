-- Elimina los datos DEMO (productos y marcas con slug terminado en "-demo").
-- Las categorías reales y sus traducciones francesas se conservan.
begin;
delete from public.products where slug like '%-demo';
delete from public.brands where slug like '%-demo';
commit;
