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

## Fase 3 — Supabase y acceso al panel (12/11/2026)

**Proyecto Supabase:** «Relax Sélection», ref `cxcphxxgwymvegjpnjrj`, región **eu-central-2 (Zúrich)**: los datos se quedan en Suiza.

**Migraciones aplicadas**
- `init_schema`.
- `seed_base`: 4 categorías, horario e idiomas fr/en.

**Aplicada el 12/11/2026:** `hardening` (`…000300_hardening.sql`). Corrige los avisos de Supabase:
- `search_path` fijo en las funciones de trigger.
- `is_staff` e `is_admin` pasan a un esquema `private`, fuera de la API.
- Las funciones de trigger dejan de poderse invocar.
- Las políticas de escritura se separan por acción.
- Índice en `products.category_id`.

Probada en local con las 9 pruebas RLS en verde. Tras aplicarla, el asesor de seguridad de Supabase queda **sin avisos** y el público sigue viendo los 12 productos publicados y 0 borradores.

**Datos DEMO:**
- Se cargan con `supabase/seed/demo.sql`, generado desde `demo-data.ts` (`npx tsx scripts/generate-demo-seed.ts`).
- Se borran con `supabase/seed/remove-demo.sql`.

**Storage:** se ha quitado la política de lectura pública del bucket `media`. Las URLs públicas siguen funcionando, pero ya no se puede **listar** el contenido del bucket.

**Lectura de contenido**
- `lib/content/supabase-source.ts` lee el catálogo completo en una consulta por tabla, dentro de `"use cache"` con la etiqueta `content` y `cacheLife("hours")` como red de seguridad. En la Fase 4, el panel la invalidará con `updateTag("content")` tras cada cambio.
- `repository.ts` usa Supabase si están las variables de entorno y los datos DEMO locales si no.
- Los idiomas activos salen de `site_settings.enabled_locales`.
- Un slug antiguo redirige con 308 al nuevo (`slug_redirects`).

**Acceso a `/admin`** (defensa en profundidad)

| Capa | Archivo | Qué hace |
|---|---|---|
| 1 | `proxy.ts` | refresca la sesión (`getClaims` valida el JWT); sin sesión → `/admin/login`; añade `X-Robots-Tag: noindex` |
| 2 | `(panel)/layout.tsx` y cada página | `requireStaff()` verifica el usuario con `getUser()` y exige rol `admin` o `editor`; si no, redirige. Las Server Actions de la Fase 4 lo llamarán también |
| 3 | RLS | aunque fallaran las dos capas anteriores, la base de datos rechaza las escrituras |

**Login** (Server Action)
- Validación en el servidor.
- Mensaje genérico, que no revela si el correo existe.
- Si la cuenta no tiene rol, cierra la sesión.
- Supabase Auth limita los intentos.

**Probado**

En el proyecto real, simulando roles dentro de una transacción deshecha:

| Rol | Resultado |
|---|---|
| `anon` | ve 12 productos publicados, 0 borradores, 0 perfiles |
| usuario sin rol | 0 borradores, 0 archivos listables |

En local:
- `/admin` y `/admin/productos` → 307 a `/admin/login`, también con una cookie de sesión falsificada.
- El login lleva `noindex`.

**Limitación de este entorno:** desde aquí no se llega a `supabase.co`, así que la web leyendo de Supabase y el login completo se prueban en Vercel o en local. El build de este entorno se hizo en modo DEMO.

**Aviso de Next.js 16:** Cache Components y Partial Prefetching serán obligatorios en la próxima versión mayor. Para entonces habrá que volver a revisar el código 404 de las fichas inexistentes (ver Fase 2).

## Fase 4 — Panel: productos, marcas y categorías (12/11/2026)

**Usuario admin:** `visualproductor@gmail.com`, con rol `admin`. Los registros públicos están desactivados en Supabase.

**Rutas del panel**

| Ruta | Qué permite |
|---|---|
| `/admin` | recuentos reales de la base de datos (sin analíticas inventadas), últimas modificaciones y accesos rápidos |
| `/admin/productos` | listado con búsqueda (nombre FR/EN o slug) y filtros por categoría, marca y estado; publicar/despublicar y destacar con un clic |
| `/admin/productos/nuevo`, `/admin/productos/[id]` | formulario completo con pestañas FR/EN: nombre, descripción corta y completa, características (una por línea), título SEO y metadescripción con contador; marca, categoría, slug, orden, estado y destacado |
| `/admin/productos/[id]/apercu` | vista previa de la ficha en FR o EN, también de borradores |
| `/admin/marcas`, `/admin/marcas/nueva`, `/admin/marcas/[id]` | CRUD, con lista de productos asociados |
| `/admin/categorias`, `/admin/categorias/nueva`, `/admin/categorias/[id]` | CRUD, con elección de icono |
| `/admin/contenidos`, `/admin/configuracion`, `/admin/seo` | páginas provisionales (Fases 6 y 7) |

**Reglas de negocio** (aplicadas en el servidor)
- El nombre en francés es obligatorio. El inglés es opcional, pero si se rellena cualquier campo, su nombre pasa a ser obligatorio. Si se vacía, se borra la traducción y la web muestra el francés.
- Para publicar un producto hace falta una descripción corta en francés, tanto desde el formulario como desde el botón rápido.
- No se puede borrar una marca o categoría con productos: el botón queda desactivado con el motivo, la acción vuelve a comprobarlo y la clave foránea `RESTRICT` lo impide en última instancia.
- El slug se genera solo a partir del nombre en francés, se puede editar y se valida con el formato del dominio SQL. Si está repetido, se muestra un mensaje claro.

**Seguridad de las escrituras**
- Cada Server Action llama a `requireStaff()` (sesión verificada y rol) antes de tocar datos.
- Los ids se validan como UUID y los campos se recortan a la longitud de la base de datos.
- Escribe con la sesión del usuario, así que RLS se aplica también aquí: nunca se usa `service_role`.
- Los errores de Postgres se traducen a mensajes comprensibles, sin mostrar detalles internos.
- Tras cada cambio, `updateTag("content")` invalida la caché pública y la web se actualiza al instante.

**Tipado:** `src/lib/supabase/database.types.ts` está generado desde el proyecto real y los tres clientes de Supabase lo usan. TypeScript comprueba cada consulta (tablas, columnas y tipos) contra el esquema real.

**Pruebas**

| Prueba | Resultado |
|---|---|
| `npm test` (slugify, lectura de formularios, validación de UUID, reglas de traducción, mensajes de error) | 6/6 |
| Escrituras del panel en el proyecto real con la sesión del admin, dentro de una transacción deshecha: crear categoría, marca y producto con traducciones; upsert; publicar; cambiar el slug | ✓ — se generan `published_at` y la redirección; no quedan restos |
| Usuario autenticado sin rol | modifica 0 filas |
| `/admin/*` sin sesión | 307 → `/admin/login` |
| Formulario renderizado en Chrome | pestañas FR/EN (los campos ocultos se siguen enviando) y contador SEO |

**Pendiente de comprobar por ti:** el flujo completo en el navegador (login y guardar), porque desde este entorno no se llega a `supabase.co`.

## Fase 5 — Imágenes (12/11/2026)

**Flujo de subida**
1. **Navegador** (`lib/media/compress.ts`):
   - Comprueba que el archivo se decodifica como imagen y limita el original a 25 MB.
   - Lo reduce al lado mayor (2000 px en fotos y portadas, 800 px en logos) y lo convierte a WebP con calidad 0,85. Si el navegador no codifica WebP, usa JPEG, o PNG para los logos con transparencia.
   - Al redibujar se eliminan los metadatos EXIF (por ejemplo, el GPS del móvil).
2. **Subida directa al bucket `media`** (`components/admin/upload.ts`), con la sesión del editor:
   - Cada archivo recibe un nombre único (UUID) y una caché de 1 año.
   - Rutas: `products/{id}/{uuid}.webp` y `brands/{id}/{logo|cover}-{uuid}.webp`.
   - Así se evita el límite de tamaño de las Server Actions en Vercel.
3. **Servidor** (`lib/admin/storage.ts`, `lib/media/signature.ts`). Antes de registrar el archivo en la base de datos:
   - valida que la ruta pertenece a ese producto o marca;
   - descarga el archivo y comprueba que pesa como máximo 5 MB y que sus primeros bytes son de JPEG, PNG, WebP o AVIF.
   - Si no cumple, **lo borra**.
4. **Bucket:** además, limita a 5 MB y a MIME de imagen, y sus políticas RLS solo dejan subir, listar y borrar al staff. SVG queda excluido a propósito, porque puede contener scripts.

**Galería de producto** (`/admin/productos/[id]`)
- Subida múltiple (máx. 12) con vista previa y progreso.
- Imagen principal (si se borra, pasa a serlo la siguiente) y orden con ← →.
- Texto alternativo FR y EN.
- Sustituir conserva la posición, la principal y el alt, y borra el archivo antiguo.
- Al eliminar una foto se borra también su archivo.

**Marcas** (`/admin/marcas/[id]`)
- Logotipo (conserva la transparencia) y portada: subir, sustituir y quitar.
- La portada se muestra en la página pública de la marca y el logo en las tarjetas.

**Limpieza:** eliminar un producto o una marca borra su carpeta del bucket, sin dejar archivos huérfanos.

**Pruebas**

| Prueba | Resultado |
|---|---|
| `npm test` | 10/10 |
| Firma de imagen: rechaza ejecutables, PDF, SVG, PHP, GIF y MP4 | ✓ |
| Rutas: rechaza otra carpeta de producto, recorrido `../`, SVG y nombres no UUID | ✓ |
| Compresión en Chrome: foto 4000×3000 | 1,7 MB → 292 KB, 2000×1500, WebP |
| Compresión en Chrome: logo PNG | conserva el alfa |
| Compresión en Chrome: «.jpg» falso y SVG | rechazados |
| Storage en el proyecto real (transacción deshecha): el admin sube y lista; un usuario sin rol | error RLS |
| Configuración del bucket | 5 MB y JPEG/PNG/WebP/AVIF |

Supabase impide borrar archivos con SQL directo (solo con su API de Storage, que es la que usa el panel), así que el borrado se probará en el navegador.

## Fase 6 — Contenidos, configuración y contacto (12/11/2026)

**Configuración** (`/admin/configuracion`, solo rol admin, también exigido por RLS)
- **Logotipo** para fondo oscuro y claro. Si existe, sustituye al SVG provisional en la cabecera, la home y el pie.
- **Datos de la tienda:** nombre, dirección, código postal, localidad y coordenadas (admite coma o punto).
- **Contacto:** teléfono, WhatsApp (si se rellena, aparece su botón) y email.
- **Enlaces:** Google Maps y Business Profile, validados (solo https y dominios de Google).
- **Redes sociales:** Instagram, Facebook y TikTok, validadas por dominio. Aparecen en el pie.
- **Horario semanal:** un tramo por día o «Cerrado».
- **Cierres y horarios excepcionales:** fecha, tipo, franja y nota. Tienen prioridad sobre el horario semanal en «Ouvert / Fermé» y se listan en la página de contacto (próximos 6).
- **Idiomas:** el francés está siempre activo y el inglés se puede activar o desactivar.

**Contenidos** (`/admin/contenidos`)
- **Bloques editables FR/EN** (`lib/content/blocks.ts`): cabecera de la home, destacados, «Venid a vernos», «À propos» (introducción y dos párrafos) y lema del pie.
- **Campos vacíos:** se muestra el texto por defecto del diccionario de ese idioma, nunca el francés personalizado en la versión inglesa. El panel enseña el texto por defecto como pista.
- **Imágenes:** fondo de la cabecera de la home (se oscurece para que el logo se lea) y foto de «À propos».

**Formulario de contacto** (`/contact`, FR/EN)
- **Campos:** nom, e-mail, message y consentimiento obligatorio, con enlace a la política de privacidad.
- **Antispam:**
  - campo trampa oculto;
  - menos de 3 s desde que se muestra el formulario = bot, que recibe un «éxito» falso y no se envía nada;
  - límite de 5 envíos por IP y hora, y 60 en total por hora (migración `contact_rate_limit`), guardando solo un hash SHA-256 con sal de la IP durante 24 h.
- **Envío:** SMTP con `nodemailer`, solo con variables de entorno (`SMTP_*`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `CONTACT_RATE_SALT`).
  - En texto plano y con `replyTo` al cliente.
  - El nombre no admite saltos de línea, para evitar la inyección de cabeceras.
  - **El mensaje no se guarda en ninguna base de datos.**
- **Sin SMTP configurado:** aviso amable («momentanément indisponible»), el texto escrito no se pierde y queda registrado en el log del servidor.
- **Privacidad:** la política (FR/EN) se ha actualizado para reflejar este tratamiento.

**Pruebas**

| Prueba | Resultado |
|---|---|
| `npm test` (contacto, configuración, días excepcionales, `openStatus`) | 19/19 |
| Límite de envíos en el PostgreSQL local | 5 por IP, después bloquea; hash no válido rechazado; el público no lee la tabla; límite global de 60/h |
| Contacto en Chrome, bot rápido | «éxito» falso y 0 intentos de envío |
| Contacto en Chrome, errores | junto a cada campo, con los valores conservados |
| Contacto en Chrome, sin SMTP | aviso de indisponible, el texto se conserva |
| Contacto en inglés | correcto |
| Editores de horario y días excepcionales en Chrome | datos alineados y ordenados |

**Error encontrado y corregido:** el editor de días excepcionales generaba los identificadores con `crypto.randomUUID()` durante el render, lo que Next 16 rechaza. Ahora usa claves deterministas.

**Migración `contact_rate_limit` aplicada el 12/11/2026.** Comprobada en el proyecto real: 5 envíos aceptados por IP, el 6.º bloqueado, y el hash no válido rechazado.

Avisos del asesor de Supabase:

| Aviso | Por qué |
|---|---|
| `contact_rate_allow` ejecutable por `anon` | Intencionado: la web la llama sin sesión, solo recibe un hash y no devuelve datos |
| `private.contact_rate` con RLS y sin políticas | Intencionado: solo accede la función |
| «Leaked password protection» desactivada | Recomendado activarla en Authentication → Providers → Email → *Prevent use of leaked passwords* (impide contraseñas filtradas). Puede requerir el plan Pro |

**Pendiente**
- **SMTP:** configurar las variables de entorno en Vercel con el correo del cliente.

## Siguientes fases

- **Fases 6–9:** según el prompt maestro.
