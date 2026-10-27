import type { AlertRule, ClientBlockParameter } from "@/lib/api/alert-rules";

export const PAGE_SIZES = [10, 20, 50];
export const REGLA_GLOBAL = "deposit_min_wages_block";

export type Draft = {
  id?: string;
  legajo: string;
  correo: string;
  /** Texto para no perder lo que se tipea; vacío = usa el general. */
  persona: string;
  empresa: string;
};

export type Generales = { persona: number | null; empresa: number | null };

export const vacio: Draft = { legajo: "", correo: "", persona: "", empresa: "" };

/** Entero >= 0 o vacío (= usa el general). */
export function leerUmbral(
  v: string,
): { ok: true; value: number | null } | { ok: false; error: string } {
  const t = v.trim();
  if (t === "") return { ok: true, value: null };
  const n = Number(t);
  if (!Number.isFinite(n)) return { ok: false, error: "Ingresá un número" };
  if (n < 0) return { ok: false, error: "No puede ser negativo" };
  if (!Number.isInteger(n)) return { ok: false, error: "Debe ser un número entero" };
  return { ok: true, value: n };
}

export const fmtUmbral = (v: number | null) => (v == null ? "General" : String(v));

/** Umbrales generales guardados en la regla global (null si no están). */
export function generalesDeRegla(regla: AlertRule | undefined): Generales {
  return {
    persona:
      typeof regla?.parameters.individual_min_wages === "number"
        ? (regla.parameters.individual_min_wages as number)
        : null,
    empresa:
      typeof regla?.parameters.company_min_wages === "number"
        ? (regla.parameters.company_min_wages as number)
        : null,
  };
}

/** Valida los dos umbrales generales (ambos obligatorios). */
export function validarGenerales(params: {
  persona: string;
  empresa: string;
}):
  | { ok: true; persona: number; empresa: number; errs: { persona?: string; empresa?: string } }
  | { ok: false; errs: { persona?: string; empresa?: string } } {
  const p = leerUmbral(params.persona);
  const e = leerUmbral(params.empresa);
  const errs = {
    persona: !p.ok ? p.error : p.value == null ? "Obligatorio" : undefined,
    empresa: !e.ok ? e.error : e.value == null ? "Obligatorio" : undefined,
  };
  if (errs.persona || errs.empresa || !p.ok || !e.ok) return { ok: false, errs };
  return { ok: true, persona: p.value as number, empresa: e.value as number, errs };
}

/** Borrador del formulario a partir de un parámetro guardado. */
export function draftDeParametro(r: ClientBlockParameter): Draft {
  return {
    id: r.id,
    legajo: r.legajo,
    correo: r.correo,
    persona: r.individualMinWages == null ? "" : String(r.individualMinWages),
    empresa: r.companyMinWages == null ? "" : String(r.companyMinWages),
  };
}

/** Valida el borrador de un cliente: devuelve el error a mostrar o los umbrales a guardar. */
export function validarDraft(
  draft: Draft,
):
  | { ok: true; individualMinWages: number | null; companyMinWages: number | null }
  | { ok: false; error: string } {
  if (!draft.legajo) return { ok: false, error: "Seleccioná un cliente de la lista." };
  const p = leerUmbral(draft.persona);
  const e = leerUmbral(draft.empresa);
  if (!p.ok || !e.ok) {
    return { ok: false, error: `Salarios mínimos: ${!p.ok ? p.error : !e.ok ? e.error : ""}` };
  }
  if (p.value == null && e.value == null) {
    return { ok: false, error: "Completá al menos uno de los dos umbrales." };
  }
  return { ok: true, individualMinWages: p.value, companyMinWages: e.value };
}

export const CSV_CABECERA = [
  "Legajo",
  "Usuario (correo)",
  "Nombre",
  "Salarios mínimos por persona",
  "Salarios mínimos por empresa",
];

/** Filas del CSV exportado: los umbrales vacíos salen como "General". */
export function filasCsv(rows: ClientBlockParameter[]): (string | number | null)[][] {
  return rows.map((r) => [
    r.legajo,
    r.correo,
    r.nombre,
    r.individualMinWages ?? "General",
    r.companyMinWages ?? "General",
  ]);
}
