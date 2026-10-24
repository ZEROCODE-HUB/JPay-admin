import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const genPath = resolve(root, "src/routeTree.gen.ts");
const outPath = resolve(root, "src/data/kb-navigation.ts");

if (!existsSync(genPath)) {
  console.error("[gen:kb] routeTree.gen.ts no encontrado");
  process.exit(0);
}

const gen = readFileSync(genPath, "utf8");
const pathRe = /'\/admin[^']*'/g;
const paths = new Set();
let m;
while ((m = pathRe.exec(gen))) {
  const p = m[0].slice(1, -1);
  if (p && p.startsWith("/admin")) paths.add(p);
}
const routes = [...paths].map((p) => p.replace(/\/+$/, "")).filter(Boolean);
const uniqueRoutes = [...new Set(routes)].sort();

/**
 * Título de la ruta: { section } si es un título de marca (se emite como pageTitle(section))
 * o { text } si es un texto fijo sin marca.
 */
function titleFor(path) {
  if (!path) return { text: "Desconocido" };
  const seg = path.split("/").filter(Boolean);
  const file = resolve(root, "src/routes", seg.join(".") + ".tsx");
  if (existsSync(file)) {
    const content = readFileSync(file, "utf8");
    const tm = content.match(
      /title:\s*(?:pageTitle\(\s*(?:["']([^"']*)["'])?\s*\)|["']([^"']+)["'])/,
    );
    if (tm) {
      if (tm[2] === undefined) return { section: tm[1] };
      return { text: tm[2] };
    }
  }
  const last = seg[seg.length - 1];
  return { text: last.charAt(0).toUpperCase() + last.slice(1) };
}

/** Expresión JS del título (para KB_ROUTES). */
function titleExpr(t) {
  if (!("section" in t)) return JSON.stringify(t.text);
  return `pageTitle(${t.section === undefined ? "" : JSON.stringify(t.section)})`;
}

/** Escapa texto fijo para insertarlo dentro de un template literal. */
const escapeTpl = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

/** Título dentro del template literal de KB_NAVIGATION (texto escapado o interpolación). */
function titleTpl(t) {
  return "section" in t ? "${" + titleExpr(t) + "}" : escapeTpl(t.text);
}

const entries = uniqueRoutes.map((p) => ({ path: p, title: titleFor(p) }));

const groups = {};
for (const e of entries) {
  const seg = e.path.split("/").filter(Boolean);
  const section = seg.length >= 2 ? seg[1] : "root";
  (groups[section] ??= []).push(e);
}

const sectionLabels = {
  general: "General",
  comercios: "Comercios",
  administracion: "Administración",
  configuracion: "Configuración",
  modulos: "Sistema",
  notificaciones: "Sistema",
  incidentes: "Comunicación",
};

// `nav` es directamente el cuerpo del template literal: todo texto fijo pasa por escapeTpl.
let nav = escapeTpl(
  "Estructura actual del panel administrativo (se genera automáticamente en cada cambio):\n\n",
);
for (const [section, items] of Object.entries(groups)) {
  const label = sectionLabels[section] ?? section.charAt(0).toUpperCase() + section.slice(1);
  nav += escapeTpl(`• ${label}:\n`);
  for (const it of items) {
    nav += `   - ${titleTpl(it.title)}  (${escapeTpl(it.path)})\n`;
  }
  nav += "\n";
}

const routesSrc = entries
  .map((e) => `  { path: ${JSON.stringify(e.path)}, title: ${titleExpr(e.title)} },`)
  .join("\n");

const out = `/* eslint-disable */
// Archivo generado automáticamente por scripts/generate-kb-nav.mjs (disparado por el hook git post-commit).
// No editar manualmente: se regenera en cada commit a partir de src/routeTree.gen.ts.
// Los títulos de marca se emiten como pageTitle(): el nombre sale de src/brand/brand.json.
import { pageTitle } from "@/brand/brand";

export const KB_NAVIGATION = \`${nav}\`;

export const KB_ROUTES: { path: string; title: string }[] = [
${routesSrc}
];
`;

writeFileSync(outPath, out, "utf8");
console.log(`[gen:kb] kb-navigation.ts generado: ${entries.length} rutas de /admin.`);
