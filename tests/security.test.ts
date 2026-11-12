/**
 * Cabeceras de seguridad y enrutado del proxy. Ejecutar con: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { contentSecurityPolicy, securityHeaders, supabaseOrigin } from "../src/lib/security/headers";

const SB = "https://abcd1234.supabase.co";
const directive = (csp: string, name: string) => csp.split("; ").find((d) => d.startsWith(name + " ")) ?? "";

test("CSP de producción: sin eval, sin <object>, sin marcos ajenos y con Supabase", () => {
  const csp = contentSecurityPolicy({ supabaseUrl: SB });
  assert.equal(csp.includes("unsafe-eval"), false);
  assert.equal(directive(csp, "object-src"), "object-src 'none'");
  assert.equal(directive(csp, "frame-ancestors"), "frame-ancestors 'none'");
  assert.equal(directive(csp, "base-uri"), "base-uri 'self'");
  assert.equal(directive(csp, "form-action"), "form-action 'self'");
  assert.equal(directive(csp, "script-src"), "script-src 'self' 'unsafe-inline'");
  assert.match(directive(csp, "connect-src"), /https:\/\/abcd1234\.supabase\.co wss:\/\/abcd1234\.supabase\.co/);
  assert.match(directive(csp, "img-src"), /https:\/\/abcd1234\.supabase\.co/);
  assert.equal(directive(csp, "frame-src"), "frame-src https://www.google.com https://maps.google.com");
  assert.ok(csp.endsWith("upgrade-insecure-requests"));
});

test("CSP de desarrollo: permite eval y websockets de recarga, sin forzar HTTPS", () => {
  const csp = contentSecurityPolicy({ isDev: true });
  assert.match(directive(csp, "script-src"), /'unsafe-eval'/);
  assert.match(directive(csp, "connect-src"), /ws:/);
  assert.equal(csp.includes("upgrade-insecure-requests"), false);
});

test("Una URL de Supabase inválida o en http no se añade a la CSP", () => {
  assert.equal(supabaseOrigin("no es una url"), null);
  assert.equal(supabaseOrigin("http://evil.example.com"), null);
  assert.equal(supabaseOrigin(undefined), null);
  assert.equal(supabaseOrigin("https://x.supabase.co/rest/v1"), "https://x.supabase.co");
  assert.equal(contentSecurityPolicy({ supabaseUrl: "http://evil.example.com" }).includes("evil"), false);
});

test("Cabeceras: HSTS solo en producción; nosniff, DENY y Permissions-Policy siempre", () => {
  const prod = Object.fromEntries(securityHeaders({}).map((h) => [h.key, h.value]));
  const dev = Object.fromEntries(securityHeaders({ isDev: true }).map((h) => [h.key, h.value]));
  assert.equal(prod["Strict-Transport-Security"], "max-age=63072000; includeSubDomains");
  assert.equal("Strict-Transport-Security" in dev, false);
  for (const h of [prod, dev]) {
    assert.equal(h["X-Content-Type-Options"], "nosniff");
    assert.equal(h["X-Frame-Options"], "DENY");
    assert.equal(h["Referrer-Policy"], "strict-origin-when-cross-origin");
    assert.match(h["Permissions-Policy"], /camera=\(\).*geolocation=\(\)/);
  }
});

// ---- Proxy (enrutado de idiomas y primera capa del panel)

async function runProxy(path: string) {
  const saved = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY };
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  try {
    const { proxy } = await import("../src/proxy");
    return await proxy(new NextRequest(new URL(path, "https://relax-selection.ch")));
  } finally {
    if (saved.url) process.env.NEXT_PUBLIC_SUPABASE_URL = saved.url;
    if (saved.key) process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = saved.key;
  }
}

test("Proxy: el francés va sin prefijo (/fr/... redirige con 308 y conserva la query)", async () => {
  const r = await runProxy("/fr/produits?categorie=cbd");
  assert.equal(r.status, 308);
  assert.equal(r.headers.get("location"), "https://relax-selection.ch/produits?categorie=cbd");
  const root = await runProxy("/fr");
  assert.equal(root.headers.get("location"), "https://relax-selection.ch/");
});

test("Proxy: /... se reescribe internamente a /fr/... y /en/... pasa tal cual", async () => {
  const r = await runProxy("/contact");
  assert.equal(r.headers.get("x-middleware-rewrite"), "https://relax-selection.ch/fr/contact");
  const home = await runProxy("/");
  assert.equal(home.headers.get("x-middleware-rewrite"), "https://relax-selection.ch/fr");
  const en = await runProxy("/en/contact");
  assert.equal(en.headers.get("x-middleware-rewrite"), null);
  assert.equal(en.headers.get("location"), null);
});

test("Proxy: /admin sin sesión (o sin Supabase) termina siempre en /admin/login", async () => {
  for (const p of ["/admin", "/admin/productos", "/admin/configuracion"]) {
    const r = await runProxy(p);
    assert.equal(r.headers.get("location"), "https://relax-selection.ch/admin/login", p);
  }
  const login = await runProxy("/admin/login");
  assert.equal(login.headers.get("location"), null);
});
