# Relax Sélection — web escaparate

Next.js 16 + Tailwind 4 + Supabase. La arquitectura, el sistema de diseño y las decisiones técnicas están en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

**Estado:** Fases 1–6 completadas (arquitectura y diseño, web pública FR/EN, Supabase y panel, CRUD, imágenes, contenidos, configuración y formulario de contacto).

Pruebas: `npm test`.

## Arrancar en local

```bash
npm install
cp .env.example .env.local   # rellena las variables de Supabase cuando exista el proyecto
npm run dev                  # http://localhost:3000
```

## Base de datos

El proyecto Supabase ya existe: ref `cxcphxxgwymvegjpnjrj`, región Zúrich. Para montarlo de nuevo en otro proyecto:

1. Ejecuta en orden los archivos de `supabase/migrations/`.
2. Si quieres datos de ejemplo, ejecuta `supabase/seed/demo.sql`.
3. Crea el usuario del cliente en **Authentication → Users → Add user** y nómbralo admin:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'correo@cliente.ch');
   ```
4. Recomendado: desactiva los registros públicos en **Authentication → Sign In / Providers → Allow new users to sign up**. Aunque una cuenta nueva no tiene permisos, mejor que no se puedan crear.

## Despliegue en Vercel

Variables de entorno (Production y Preview):

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública (sin barra final) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://cxcphxxgwymvegjpnjrj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | la clave `sb_publishable_…` del proyecto |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | servidor de correo del cliente (465 = TLS, 587 = STARTTLS) |
| `CONTACT_TO_EMAIL` | adonde llegan los mensajes del formulario |
| `CONTACT_FROM_EMAIL` | remitente autorizado en ese servidor SMTP |
| `CONTACT_RATE_SALT` | cadena larga aleatoria (sal del hash de IP) |

## Probar las políticas RLS en local (opcional)

Necesitas PostgreSQL 16:

```bash
createdb relax_test
psql -d relax_test -f supabase/tests/00_supabase_stub.sql
psql -d relax_test -f supabase/migrations/20261112000100_init_schema.sql
psql -d relax_test -f supabase/migrations/20261112000200_seed_base.sql
psql -d relax_test -f supabase/tests/rls_and_constraints.sql
```
