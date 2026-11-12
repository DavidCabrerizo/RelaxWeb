# Relax Sélection — Arquitectura (Fase 1)

Web escaparate a medida para Relax Sélection (vape, CBD, e-liquides y accesorios, Ginebra), con panel de administración propio. Sin CMS externos, sin e-commerce.

## Stack (versiones verificadas el 12/11/2026)

| Pieza | Versión | Nota |
|---|---|---|
| Next.js (App Router, Turbopack) | 16.4.6 | `middleware` pasa a llamarse `proxy` en esta versión |
| React | 19.3 | |
| Tailwind CSS | 4.3 | tokens en `@theme` dentro de `globals.css` (sin `tailwind.config`) |
| @supabase/ssr · supabase-js | 0.12.7 · 2.119 | |
| Fuente | Montserrat variable, **autoalojada** | sin Google Fonts: mejor privacidad (nLPD) y build sin red |

## Estructura de carpetas

```
src/
  app/
    (public)/[lang]/        ← web pública, raíz con <html lang> por idioma
      layout.tsx
      page.tsx              ← Accueil
      produits/ …           ← Fase 2
    (admin)/admin/          ← panel, raíz propia (<html lang="es">, noindex)
    fonts/                  ← Montserrat .woff2 + localFont
    globals.css             ← sistema de diseño (tokens)
  components/
    brand/                  ← Logo (placeholder DEMO), Waves, CategoryIcon
    ui/                     ← Button… (Fase 2: Card, Filter, Form…)
    layout/                 ← Header, Footer (Fase 2)
  i18n/dictionaries/        ← textos de interfaz: fr.json, en.json
  lib/
    i18n/                   ← config de idiomas + carga de diccionarios
    supabase/               ← clientes servidor y navegador
    site/                   ← valores por defecto (horario de la fachada)
  proxy.ts                  ← enrutado de idiomas (sesión admin en Fase 3)
supabase/
  migrations/               ← SQL versionado
  tests/                    ← pruebas RLS/restricciones ejecutables con psql
docs/
```

Las dos zonas tienen **layouts raíz separados** (route groups), así que la web pública y el panel no comparten cabecera, metadatos ni bundle.

## Mapa de rutas

| URL pública | Archivo | Fase |
|---|---|---|
| `/` | `(public)/[lang]/page.tsx` | 1 (vista previa) → 2 |
| `/produits`, `/produits/[slug]` | `(public)/[lang]/produits/…` | 2 |
| `/categories/[slug]` | `(public)/[lang]/categories/[slug]` | 2 |
| `/marques`, `/marques/[slug]` | `(public)/[lang]/marques/…` | 2 |
| `/a-propos`, `/contact` | `(public)/[lang]/…` | 2 / 6 |
| `/mentions-legales`, `/confidentialite` | `(public)/[lang]/…` | 7 |
| `/sitemap.xml`, `/robots.txt` | `app/sitemap.ts`, `app/robots.ts` | 7 |
| `/admin/*` | `(admin)/admin/…` | 3–6 |

Los slugs de las rutas (`produits`, `marques`…) se mantienen en francés también en el segundo idioma (`/en/produits/x`). Es una decisión deliberada: simplifica las redirecciones y el hreflang, y no penaliza el SEO.

## Estrategia multidioma

**URLs**
- El francés (fr-CH) va **sin prefijo**. `proxy.ts` reescribe internamente `/x` → `/fr/x`.
- `/fr/x` redirige con un 308 a `/x`, para que nunca haya dos URLs con el mismo contenido.
- Los idiomas secundarios llevan prefijo: `/en/x`.
- Un idioma soportado pero no activo devuelve 404 (comprobado: hoy `/en` → 404).

**Textos de interfaz:** `src/i18n/dictionaries/*.json`. El francés es la referencia de tipos, así que si a otro idioma le falta una clave, TypeScript lo marca.

**Contenido de la base de datos:** tablas `*_translations`, con una fila por idioma, en lugar de columnas por idioma.
- *Por qué:* añadir alemán o italiano es insertar filas, sin migración ni cambios en los formularios del admin (que iteran sobre los idiomas activos).
- *Coste:* un join más por consulta. Es irrelevante con ~30 productos.
- Si una traducción no existe, se muestra la francesa (Fase 2).

**Activación:** `site_settings.enabled_locales` (desde el admin). Hasta la Fase 3 se lee de `NEXT_PUBLIC_ENABLED_LOCALES`.

## Sistema de diseño

Colores medidos sobre la foto de la fachada:

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `ink` | #111111 | fondo principal | — |
| `ink-2` / `ink-3` | #1A1A1A / #242624 | superficies oscuras | — |
| `lime` | #7EF424 | botones, iconos y acentos sobre oscuro | 13,4:1 sobre ink ✓ |
| `lime-ink` | #3B7A12 | texto verde sobre fondo claro | 5,3:1 sobre blanco ✓ |
| `mist` / `paper` | #F5F6F4 / #FFF | secciones claras | — |
| `muted` / `muted-dark` | #5E655C / #A3A8A0 | texto secundario | 6,0:1 / 7,8:1 ✓ |

`lime` sobre blanco da 1,4:1, así que **nunca** se usa para texto en zonas claras. Para eso está `lime-ink`.

**Elementos de marca**
- **Tipografía:** Montserrat variable. Títulos en mayúsculas, 800–900.
- **Logotipo** (`Logo.tsx`): placeholder SVG marcado como DEMO, con variantes `dark` y `light`. Se sustituye por el archivo subido en `/admin/configuracion`.
- **Ondas** (`Waves.tsx`): separador verde y blanco, como el vinilo del escaparate.
- **Iconos de categoría** (`CategoryIcon.tsx`): vape, cbd, eliquid y accessories, de línea dentro de un círculo verde.

**Movimiento:** solo `animate-rise` y los hovers con `shadow-glow`. Todo se desactiva con `prefers-reduced-motion`.

## Base de datos (Supabase)

Migraciones en `supabase/migrations/`:
- `…000100_init_schema.sql`: tablas, triggers, RLS y bucket de Storage.
- `…000200_seed_base.sql`: las 4 categorías del escaparate y el horario real. No hay datos DEMO aquí.

| Tabla | Contenido |
|---|---|
| `profiles` | rol `none` / `editor` / `admin`; se crea al registrarse, sin permisos |
| `categories` + `category_translations` | icono, orden, publicación |
| `brands` + `brand_translations` | logo, portada, destacada, orden |
| `products` + `product_translations` | estado draft/published, destacado, orden, características (jsonb) |
| `product_images` | ruta en Storage, alt por idioma, una sola principal (índice único parcial) |
| `slug_redirects` | rellenada por trigger al cambiar un slug; sin cadenas de redirección |
| `site_settings` | fila única: NAP, coordenadas, horario, cierres excepcionales, idiomas, logos |
| `page_content` | bloques editables por clave e idioma (`home.hero`, `footer`…) |
| `seo_metadata` | título, descripción y noindex de las páginas estáticas |

**Seguridad (defensa en profundidad)**
1. **RLS en todas las tablas.** El público solo lee lo publicado. Solo `is_staff()` escribe y solo `is_admin()` cambia la configuración y los roles.
2. **Nadie se asigna un rol desde la API.** El primer admin se nombra desde el SQL Editor (ver abajo).
3. **Storage:** el bucket `media` limita a JPEG/PNG/WebP/AVIF y 5 MB en el servidor de Supabase. Solo el staff sube o borra archivos.
4. **Fase 3:** el panel comprobará la sesión y el rol en el servidor (layout de `/admin` y cada Server Action), además de en `proxy.ts`. Ocultar botones no es la protección.
5. **`SUPABASE_SERVICE_ROLE_KEY`** solo existe como variable de servidor, sin prefijo `NEXT_PUBLIC_`.

Nombrar al primer admin, tras registrarlo en Supabase Auth:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'correo@cliente.ch');
```

**Pruebas:** `supabase/tests/` imita lo mínimo de `auth` y `storage` para ejecutarse con psql en local. Resultados del 12/11/2026, las 9 en verde:

| # | Prueba | Resultado |
|---|---|---|
| T1 | El anónimo solo ve lo publicado | ✓ |
| T2 | El anónimo no escribe | ✓ |
| T3 | Un usuario sin rol no escribe, no se asciende ni sube archivos | ✓ |
| T4 | El admin ve los borradores y sube archivos | ✓ |
| T5 | Un cambio de slug crea una redirección y no la encadena | ✓ |
| T6 | No se borra una marca con productos | ✓ |
| T7 | Se rechazan los slugs inválidos | ✓ |
| T8 | Solo una imagen principal por producto | ✓ |
| T9 | `published_at` se fija al publicar | ✓ |

Error encontrado y corregido durante las pruebas: la protección de rol también bloqueaba al superusuario, así que habría sido imposible nombrar al primer admin. Ahora solo se aplica a los roles de la API (`anon` y `authenticated`).

## Pendiente de datos del cliente

- Dirección, código postal, coordenadas, teléfono, WhatsApp y email.
- URL de la ficha de Google Maps / Business Profile.
- Logo en vectorial (SVG/AI) para sustituir el placeholder.
- Marcas que trabajan y los primeros productos (con fotos).
- Dominio definitivo.

## Fase 2 — Web pública (12/11/2026)

**Idiomas:** francés (`/`) e inglés (`/en`), los dos activos.
- El selector FR/EN conserva la página en la que estás.
- Cada página lleva `canonical`, `hreflang` (fr-CH, en y x-default) y un `<html lang>` correcto.

**Páginas** (`app/(public)/[lang]/…`)

| Página | Qué incluye |
|---|---|
| Accueil | hero con el logo, estado «Ouvert / Fermé», 4 categorías, 4 productos destacados, marcas destacadas, horario, «Itinéraire / Appeler» y localidades cercanas |
| `produits` | catálogo con filtros por categoría y marca (`?categorie=` y `?marque=`, validados); las vistas filtradas comparten canonical con `/produits` |
| `produits/[slug]` | ficha con características, categoría, marca, «Disponible en boutique» y productos relacionados |
| `categories/[slug]`, `marques`, `marques/[slug]`, `a-propos`, `contact` | — |
| `mentions-legales`, `confidentialite` | plantillas FR/EN con un aviso de «texto provisional» |
| 404 | bilingüe y con código 404 real |

**Contenido DEMO:** `lib/content/demo-data.ts`, con 4 marcas ficticias y 12 productos (3 por categoría), sin precios ni afirmaciones de salud.
- Las páginas solo leen a través de `lib/content/repository.ts`. En la Fase 3 se cambia esa implementación por Supabase sin tocar las páginas.
- Si falta una traducción, se muestra el francés.

**Cumplimiento**
- **Aviso de +18:** cookie `rs_age` durante 1 año. Se monta en el navegador, así que el HTML sigue siendo indexable.
- **Banner de cookies:** cookie `rs_consent`. Aparece después del aviso de edad y prepara la carga de Google Maps con consentimiento (Fase 7).
- **Datos que faltan:** si no hay dirección ni teléfono, los botones «Itinéraire» y «Appeler» se muestran desactivados. No se inventan datos.

**Decisiones técnicas de esta fase**
- **`partialPrefetching` desactivado.** Con esa opción, una ficha inexistente respondía 200 en lugar de 404, porque el streaming empieza antes de `notFound()`. Comprobado después del cambio: `/produits/x`, `/en/produits/x`, `/marques/x` y `/categories/x` → 404.
- **Catálogo:** el listado filtrado va dentro de `<Suspense>`, porque lee `searchParams`. El resto de páginas son estáticas.
- **Componentes cliente:** el selector de idioma y el menú quitan el prefijo de idioma a la ruta (`lib/i18n/path.ts`). Así el servidor (`/fr/x`) y el navegador (`/x`) calculan lo mismo y no hay errores de hidratación.
- **Lint limpio:** las cookies y la fecha se leen con `useSyncExternalStore`, y el menú se cierra con ajuste de estado durante el render.

**Logo:** placeholder ajustado a la referencia (`docs/brand/logo-referencia.png`): letras rectas, ola verde, A verde con hoja, X con trazo verde y humo.

**Probado en Chrome** (390 px y 1366 px):
- El aviso de edad aparece y se cierra.
- El banner de cookies funciona.
- FR ↔ EN conserva la ficha y cambia `lang` y el título.
- El menú móvil se abre y se cierra al navegar.
- El filtro CBD devuelve 3 productos.
- No hay peticiones fallidas.

## Siguientes fases

- **Fase 3:** conexión a Supabase, auth, sesión en `proxy.ts` y protección de `/admin`.
- **Fases 4–9:** según el prompt maestro.
