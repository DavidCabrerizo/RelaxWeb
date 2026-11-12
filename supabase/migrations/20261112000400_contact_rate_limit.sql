-- =====================================================================
-- Límite de envíos del formulario de contacto
--  - Se guarda SOLO un hash (SHA-256 con sal secreta del servidor) de la IP y la hora.
--    Nunca el nombre, el email ni el mensaje (nLPD: minimización de datos).
--  - Los registros se borran a las 24 h.
--  - Máximo por IP: 5 envíos/hora. Máximo global: 60 envíos/hora (frena ataques con IPs rotativas).
-- La tabla vive en el esquema `private` (no expuesto por la API).
-- =====================================================================

create table private.contact_rate (
  ip_hash     text not null check (ip_hash ~ '^[a-f0-9]{64}$'),
  created_at  timestamptz not null default now()
);
create index contact_rate_lookup_idx on private.contact_rate (ip_hash, created_at);
create index contact_rate_created_idx on private.contact_rate (created_at);
alter table private.contact_rate enable row level security; -- sin políticas: solo la función accede

create or replace function public.contact_rate_allow(p_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  per_ip  int;
  overall int;
begin
  if p_hash is null or p_hash !~ '^[a-f0-9]{64}$' then
    return false;
  end if;

  delete from private.contact_rate where created_at < now() - interval '1 day';

  select count(*) into per_ip from private.contact_rate
   where ip_hash = p_hash and created_at > now() - interval '1 hour';
  select count(*) into overall from private.contact_rate
   where created_at > now() - interval '1 hour';

  if per_ip >= 5 or overall >= 60 then
    return false;
  end if;

  insert into private.contact_rate (ip_hash) values (p_hash);
  return true;
end;
$$;

comment on function public.contact_rate_allow(text) is
  'Límite de envíos del formulario de contacto. Pública a propósito (la llama la web sin sesión). Solo recibe un hash.';

revoke all on function public.contact_rate_allow(text) from public;
grant execute on function public.contact_rate_allow(text) to anon, authenticated;
