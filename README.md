# Relax Sélection — web escaparate

Next.js 16 + Tailwind 4 + Supabase. La arquitectura, el sistema de diseño y las decisiones técnicas están en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

**Estado:** Fase 1 completada (arquitectura, diseño, esquema de base de datos).

## Arrancar en local

```bash
npm install
cp .env.example .env.local   # rellena las variables de Supabase cuando exista el proyecto
npm run dev                  # http://localhost:3000
```

## Base de datos

1. Crea un proyecto en Supabase.
2. Ejecuta, en orden, los archivos de `supabase/migrations/`: con `supabase db push` o pegándolos en el SQL Editor.
3. Registra al usuario del cliente en Auth y nómbralo admin. La consulta está en `docs/ARCHITECTURE.md`.

## Probar las políticas RLS en local (opcional)

Necesitas PostgreSQL 16:

```bash
createdb relax_test
psql -d relax_test -f supabase/tests/00_supabase_stub.sql
psql -d relax_test -f supabase/migrations/20261112000100_init_schema.sql
psql -d relax_test -f supabase/migrations/20261112000200_seed_base.sql
psql -d relax_test -f supabase/tests/rls_and_constraints.sql
```
