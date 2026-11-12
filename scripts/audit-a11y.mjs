/**
 * Auditoría automática de accesibilidad (axe-core, WCAG 2.2 AA) y de errores de consola / CSP.
 *
 *   npm run audit:a11y                         → contra http://localhost:3000
 *   BASE_URL=https://relax-selection.ch npm run audit:a11y
 *
 * Revisa las páginas públicas en móvil y escritorio, y la verificación de edad y el aviso de
 * cookies sin cookies previas. Sale con código 1 si encuentra incidencias.
 * Requisito local: un Chromium de Playwright (npx playwright install chromium) o CHROME_PATH.
 * Una herramienta automática detecta solo parte de los problemas: no sustituye a probar con
 * teclado y lector de pantalla.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const PAGES = ["/", "/produits", "/marques", "/a-propos", "/contact", "/mentions-legales", "/confidentialite", "/en", "/en/contact", "/page-inexistante", "/admin/login"];

// El primer producto, marca y categoría publicados se sacan del sitemap
async function samplePages() {
  try {
    const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    return ["/produits/", "/marques/", "/categories/"].map((p) => locs.find((l) => l.startsWith(p) && l.length > p.length)).filter(Boolean);
  } catch {
    return [];
  }
}

async function audit(browser, { label, viewport, cookies, pages }) {
  const ctx = await browser.newContext({ viewport });
  if (cookies) await ctx.addCookies(Object.entries(cookies).map(([name, value]) => ({ name, value, url: BASE })));
  let problems = 0;
  for (const path of pages) {
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    // El mapa de Google no forma parte de la auditoría
    await page.route(/https:\/\/(www|maps)\.google\.com\//, (r) => r.fulfill({ status: 204, body: "" }));
    await page.goto(BASE + path, { waitUntil: "load" });
    await page.waitForTimeout(600);
    await page.addScriptTag({ content: AXE });
    const violations = await page.evaluate(async () => {
      const r = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, targets: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) }));
    });
    const relevant = errors.filter((e) => /Refused|Content Security Policy|hydrat|Error/i.test(e) && !/google\.com/.test(e));
    if (violations.length || relevant.length) {
      console.log(`\n[${label}] ${path}`);
      for (const v of violations) console.log(`  axe ${v.impact} ${v.id}: ${v.help}\n      ${v.targets.join("\n      ")}`);
      for (const e of relevant) console.log(`  consola: ${e.slice(0, 300)}`);
      problems += violations.length + relevant.length;
    }
    await page.close();
  }
  await ctx.close();
  console.log(`[${label}] ${pages.length} páginas, ${problems} incidencias`);
  return problems;
}

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const pages = [...PAGES, ...(await samplePages())];
const ok = { rs_age: "1", rs_consent: "declined" };
let total = 0;
total += await audit(browser, { label: "móvil", viewport: { width: 390, height: 844 }, cookies: ok, pages });
total += await audit(browser, { label: "escritorio", viewport: { width: 1366, height: 900 }, cookies: ok, pages });
total += await audit(browser, { label: "primera visita (edad + cookies)", viewport: { width: 390, height: 844 }, pages: ["/", "/en"] });
await browser.close();
process.exit(total ? 1 : 0);
