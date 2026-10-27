// supabase/functions/plaft-control-terroristas/index.ts
// Control diario PLAFT: clientes personas físicas vs. lista REPET.
// Las alertas en public.alertas las crea el trigger trg_plaft_coincidencia_alerta
// cada vez que se inserta una coincidencia nueva en plaft_coincidencias.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const REPET_URL = "https://repet.jus.gob.ar/xml/personas.json";
const UMBRAL = Number(Deno.env.get("PLAFT_UMBRAL") ?? "0.75"); // 75% por defecto
const PAGE = 1000;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ---------- Tipos ----------
interface PersonaRepet {
  DATAID: string;
  FIRST_NAME?: string;
  SECOND_NAME?: string;
  THIRD_NAME?: string;
  FOURTH_NAME?: string;
  LIST_TYPE?: string;
  UN_LIST_TYPE?: string;
  REFERENCE_NUMBER?: string;
  DELISTED_ON?: string;
  INDIVIDUAL_ALIAS?: { ALIAS_NAME?: string }[];
}

interface EntradaLista {
  dataid: string;
  nombreLista: string; // nombre principal en la lista
  variante: string; // nombre o alias contra el que se comparó
  tokens: string[];
  sorted: string;
  lista: string;
  referencia: string;
}

// ---------- Normalización y similitud ----------
function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // saca acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizar(s: string) {
  const tokens = normalizar(s).split(" ").filter(Boolean);
  return { tokens, sorted: [...tokens].sort().join(" ") };
}

const BUF_A = new Uint16Array(256);
const BUF_B = new Uint16Array(256);

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length > 255) a = a.slice(0, 255);
  if (b.length > 255) b = b.slice(0, 255);
  const m = a.length,
    n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = BUF_A,
    cur = BUF_B;
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      const x = prev[j] + 1,
        y = cur[j - 1] + 1,
        z = prev[j - 1] + cost;
      cur[j] = x < y ? (x < z ? x : z) : y < z ? y : z;
    }
    const t = prev;
    prev = cur;
    cur = t;
  }
  return prev[n];
}

function ratio(a: string, b: string): number {
  const L = Math.max(a.length, b.length);
  return L ? 1 - levenshtein(a, b) / L : 1;
}

// Similitud 0..1. Ignora el orden de las palabras ("Perez Juan" == "Juan Perez")
// y tolera que un lado tenga menos nombres que el otro.
function similitud(cTokens: string[], cSorted: string, tTokens: string[], tSorted: string): number {
  const full = ratio(cSorted, tSorted);
  const [corto, largo] = cTokens.length <= tTokens.length ? [cTokens, tTokens] : [tTokens, cTokens];
  if (corto.length < 2) return full;
  // Emparejamiento uno a uno: cada palabra de un lado se usa UNA sola vez
  const pares: [number, number, number][] = [];
  corto.forEach((t, i) => largo.forEach((u, j) => pares.push([ratio(t, u), i, j])));
  pares.sort((x, y) => y[0] - x[0]);
  const usadosI = new Set<number>();
  const usadosJ = new Set<number>();
  let suma = 0;
  for (const [r, i, j] of pares) {
    if (usadosI.has(i) || usadosJ.has(j)) continue;
    usadosI.add(i);
    usadosJ.add(j);
    suma += r;
    if (usadosI.size === corto.length) break;
  }
  // Se divide por la cantidad de palabras del nombre MÁS LARGO: cada palabra de más penaliza
  // el puntaje ("Juan Carlos" vs "Juan Carlos Bañuelos Ramirez" = 2/4 = 50%).
  const tokenScore = suma / largo.length;
  return Math.max(full, tokenScore);
}

// ---------- Lista REPET ----------
async function cargarLista(): Promise<EntradaLista[]> {
  const res = await fetch(REPET_URL);
  if (!res.ok) throw new Error(`No se pudo descargar la lista REPET (${res.status})`);
  const data: PersonaRepet[] = await res.json();

  const entradas: EntradaLista[] = [];
  for (const p of data) {
    if (p.DELISTED_ON) continue; // ya fue dada de baja de la lista

    const principal = [p.FIRST_NAME, p.SECOND_NAME, p.THIRD_NAME, p.FOURTH_NAME]
      .filter(Boolean)
      .join(" ")
      .trim();
    const variantes = new Set<string>();
    if (principal) variantes.add(principal);
    for (const a of p.INDIVIDUAL_ALIAS ?? []) {
      if (a.ALIAS_NAME) variantes.add(a.ALIAS_NAME);
    }

    for (const v of variantes) {
      const { tokens, sorted } = tokenizar(v);
      if (!tokens.length) continue; // p. ej. alias solo en árabe
      entradas.push({
        dataid: String(p.DATAID),
        nombreLista: principal,
        variante: v,
        tokens,
        sorted,
        lista: [p.LIST_TYPE, p.UN_LIST_TYPE].filter(Boolean).join(" - "),
        referencia: p.REFERENCE_NUMBER ?? "",
      });
    }
  }
  return entradas;
}

// ---------- Notificación (Resend) ----------
async function notificar(nuevas: Record<string, unknown>[]) {
  const key = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("PLAFT_EMAIL_TO");
  if (!key || !to || !nuevas.length) return;

  const filas = nuevas
    .map(
      (c) =>
        `<tr><td>${c.cliente_nombre}</td><td>${c.lista_nombre} (${c.lista_variante})</td>` +
        `<td>${Math.round(Number(c.similitud) * 100)}%</td><td>${c.lista_origen} ${c.lista_referencia}</td></tr>`,
    )
    .join("");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("PLAFT_EMAIL_FROM") ?? "alertas@tudominio.com",
      to: to.split(","),
      subject: `ALERTA PLAFT: ${nuevas.length} coincidencia(s) con lista de terroristas`,
      html: `<p>Se detectaron coincidencias nuevas para analizar:</p>
<table border="1" cellpadding="4" cellspacing="0">
<tr><th>Cliente</th><th>Lista</th><th>Match</th><th>Origen</th></tr>${filas}</table>`,
    }),
  });
}

// ---------- Handler ----------
Deno.serve(async (req) => {
  const inicio = Date.now();
  let offset = 0;
  let limit = 500; // clientes por invocación (evita WORKER_RESOURCE_LIMIT)
  try {
    const body = await req.json();
    if (body?.offset) offset = Number(body.offset);
    if (body?.limit) limit = Number(body.limit);
  } catch {
    /* sin body: procesa todos */
  }

  try {
    const lista = await cargarLista();

    // Índice por inicial de cada palabra: evita comparar contra toda la lista
    const indice = new Map<string, number[]>();
    lista.forEach((e, i) => {
      for (const l of new Set(e.tokens.map((t) => t[0]))) {
        const arr = indice.get(l);
        if (arr) arr.push(i);
        else indice.set(l, [i]);
      }
    });

    let totalClientes = 0;
    let leidos = 0;
    const nuevasCoincidencias: Record<string, unknown>[] = [];

    for (let desde = offset; desde < offset + limit; desde += PAGE) {
      const hasta = Math.min(desde + PAGE, offset + limit) - 1;
      const { data: clientes, error } = await supabase
        .from("clientes")
        .select("id, nombre")
        .eq("tipo_persona", "fisica")
        .order("id")
        .range(desde, hasta);
      if (error) throw error;
      if (!clientes?.length) break;
      leidos += clientes.length;

      const filas: Record<string, unknown>[] = [];
      for (const c of clientes) {
        if (!c.nombre) continue;
        totalClientes++;
        const { tokens, sorted } = tokenizar(c.nombre);
        if (!tokens.length) continue;

        // Mejor coincidencia por persona de la lista (considera todos sus alias)
        const mejores = new Map<string, { e: EntradaLista; s: number }>();
        const candidatos = new Set<number>();
        for (const l of new Set(tokens.map((t) => t[0]))) {
          for (const i of indice.get(l) ?? []) candidatos.add(i);
        }
        for (const i of candidatos) {
          const e = lista[i];
          const s = similitud(tokens, sorted, e.tokens, e.sorted);
          if (s >= UMBRAL) {
            const prev = mejores.get(e.dataid);
            if (!prev || s > prev.s) mejores.set(e.dataid, { e, s });
          }
        }
        for (const { e, s } of mejores.values()) {
          filas.push({
            cliente_id: String(c.id),
            cliente_nombre: c.nombre,
            lista_dataid: e.dataid,
            lista_nombre: e.nombreLista,
            lista_variante: e.variante,
            lista_origen: e.lista,
            lista_referencia: e.referencia,
            similitud: Number(s.toFixed(4)),
          });
        }
      }

      if (filas.length) {
        // unique (cliente_id, lista_dataid) + ignoreDuplicates:
        //  - devuelve SOLO las filas realmente nuevas
        //  - un falso positivo ya registrado no vuelve a generar alerta
        // Por cada fila nueva, el trigger trg_plaft_coincidencia_alerta crea
        // la alerta en public.alertas dentro de la misma transacción.
        const { data: insertadas, error: errIns } = await supabase
          .from("plaft_coincidencias")
          .upsert(filas, { onConflict: "cliente_id,lista_dataid", ignoreDuplicates: true })
          .select();
        if (errIns) throw errIns;
        nuevasCoincidencias.push(...(insertadas ?? []));
      }

      if (clientes.length < PAGE) break;
    }

    await notificar(nuevasCoincidencias);

    const resumen = {
      estado: "ok",
      umbral: UMBRAL,
      total_clientes: totalClientes,
      total_lista: lista.length,
      coincidencias_nuevas: nuevasCoincidencias.length,
      duracion_ms: Date.now() - inicio,
    };
    await supabase.from("plaft_corridas").insert(resumen);
    // Si leyó un lote completo puede haber más clientes: invocar de nuevo con este offset
    const siguiente_offset = leidos >= limit ? offset + limit : null;
    return Response.json({ ...resumen, siguiente_offset });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    await supabase.from("plaft_corridas").insert({
      estado: "error",
      error: msg,
      umbral: UMBRAL,
      duracion_ms: Date.now() - inicio,
    });
    return Response.json({ estado: "error", error: msg }, { status: 500 });
  }
});
