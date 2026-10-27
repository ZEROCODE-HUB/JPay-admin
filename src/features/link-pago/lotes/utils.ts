import type { LoteAcreditacion } from "@/lib/api/types";

export const PAGE_SIZES = [10, 20, 50];

/** Comisión por cierre de lote que se muestra cuando el lote todavía no la tiene grabada. */
export const COMISION_CIERRE_PCT_DEFAULT = 0.45;

export function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Nombre visible del comercio del lote (o `fallback` si no vino el embed). */
export function nombreComercio(l: LoteAcreditacion, fallback = "—"): string {
  return l.comercio?.nombreComercio ?? l.comercio?.usuario ?? fallback;
}

/** Legajo del comercio del lote (cae al id si no vino el embed). */
export function legajoComercio(l: LoteAcreditacion): string {
  return l.comercio?.legajo ?? l.comercioId;
}

/**
 * ¿El lote está todavía en etapa de proyección?
 *
 * En `Programado` los importes son estimaciones y la comisión por
 * cierre de lote (0,45%) NO se descuenta hasta que se aplica la
 * liquidación de Payway. A partir de `Pendiente` (con el snapshot
 * real del CSV ya grabado) y `Acreditado`, todos los importes son
 * firmes y la 0,45% ya fue debitada.
 */
export function esLoteEstimado(l: LoteAcreditacion): boolean {
  return l.estado === "Programado";
}

/**
 * Tasas (en pesos) que la UI muestra en el desglose del lote.
 *
 * NO se leen de las columnas `tasa_payway_monto` / `tasa_molipay_monto`
 * de la DB: esos valores vienen mal acumulados del job que arma los
 * lotes (no son el resultado correcto de `bruto × pct / 100`). Para
 * no mentir en pantalla, los recalculamos acá a partir del bruto y
 * el porcentaje, que es lo que la regla de negocio manda.
 *
 * En el snapshot del CSV (estado Pendiente) las columnas se
 * sobreescriben con el cálculo del modal de acreditación, así que
 * después de aplicar la liquidación estos números siguen siendo
 * válidos como auditoría: importes_bruto × pct / 100.
 */
export function tasasCalculadas(l: LoteAcreditacion): {
  paywayMonto: number;
  propiaMonto: number;
} {
  const paywayPct = Number(l.tasaPaywayPct) || 0;
  const propiaPct = Number(l.tasaPropiaPct) || 0;
  const bruto = Number(l.importeBruto) || 0;
  return {
    paywayMonto: round2((bruto * paywayPct) / 100),
    propiaMonto: round2((bruto * propiaPct) / 100),
  };
}

export type ImpuestosLote = {
  iva: number;
  debitoCredito: number;
  iibb: number;
  legacy: number;
  /** Suma de los snapshots reales (IVA + Débito/Crédito + IIBB). */
  totalReal: number;
  /** Los 3 snapshots en 0 y el legacy > 0: lote viejo con la fórmula hardcoded. */
  usarLegacy: boolean;
  /** Impuestos que efectivamente se descuentan. */
  total: number;
};

/**
 * Impuestos del lote. Usa los snapshots reales del motor de retenciones;
 * si los 3 están en 0 y el legacy > 0, cae al legacy (lotes viejos
 * acreditados con la fórmula hardcoded).
 */
export function impuestosLote(l: LoteAcreditacion): ImpuestosLote {
  const iva = l.ivaMonto ?? 0;
  const debitoCredito = l.debitoCreditoMonto ?? 0;
  const iibb = l.iibbMonto ?? 0;
  const legacy = l.impuestos ?? 0;
  const totalReal = iva + debitoCredito + iibb;
  const usarLegacy = totalReal === 0 && legacy > 0;
  return {
    iva,
    debitoCredito,
    iibb,
    legacy,
    totalReal,
    usarLegacy,
    total: usarLegacy ? legacy : totalReal,
  };
}

/**
 * Suma de descuentos que se muestra al operador.
 *
 * Reglas:
 *  - Las tasas PayWay / plataforma se calculan como `bruto × pct / 100`
 *    (ver `tasasCalculadas`); las columnas de la DB quedan como auditoría.
 *  - En `Programado` el 0,45% no se debita todavía, así que se excluye
 *    del total mostrado. En `Pendiente`/`Acreditado`/`Contracargo` se
 *    incluye como cualquier otro descuento firme.
 */
export function totalDescuentos(l: LoteAcreditacion): number {
  const cierre = esLoteEstimado(l) ? 0 : (l.comisionCierreLoteMonto ?? 0);
  const tasas = tasasCalculadas(l);
  return (
    impuestosLote(l).total +
    tasas.paywayMonto +
    tasas.propiaMonto +
    (l.costoPaywayPagoUnico ?? 0) +
    cierre +
    (l.contracargoMonto ?? 0)
  );
}

/**
 * Porcentaje de cierre de lote a mostrar. Los lotes Programado guardan
 * 0 porque el 0,45% no se debita hasta confirmar la liquidación; para no
 * mostrar "0%" en el desglose se cae al default. El monto en $ sigue
 * siendo 0 en Programado.
 */
export function comisionCierrePct(l: LoteAcreditacion): number {
  return (l.comisionCierreLotePct ?? 0) > 0
    ? (l.comisionCierreLotePct as number)
    : COMISION_CIERRE_PCT_DEFAULT;
}

/** Valor del input de contracargo → número (vacío = no se envía). */
export function parseContracargoInput(v: string): number | undefined {
  return v.trim() === "" ? undefined : parseFloat(v.replace(",", ".")) || 0;
}

/** Acepta solo montos decimales con `.` o `,`. */
export function esMontoValido(v: string): boolean {
  return v === "" || /^[0-9]*[.,]?[0-9]*$/.test(v);
}

/**
 * Neto recalculado que muestra el modal de contracargo: bruto − impuestos
 * (columna legacy) − tasas recalculadas − contracargo tipeado − cierre.
 */
export function netoConContracargo(l: LoteAcreditacion, contracargoInput: string): number {
  const tasas = tasasCalculadas(l);
  return (
    l.importeBruto -
    l.impuestos -
    tasas.paywayMonto -
    tasas.propiaMonto -
    (parseFloat(contracargoInput.replace(",", ".") || "0") || 0) -
    (l.comisionCierreLoteMonto ?? 0)
  );
}

export type ResumenComercio = {
  comercio: string;
  legajo: string;
  comercioId: string;
  cantidadLotes: number;
  cantidadOps: number;
  totalBruto: number;
  totalImpuestos: number;
  totalPayWay: number;
  totalPropio: number;
  totalContracargo: number;
  totalFinal: number;
  pendienteAcreditar: number;
  pendienteImpuestos: number;
};

/** Agrupa los lotes por comercio (agregación client-side sobre la página actual). */
export function resumirPorComercio(lotes: LoteAcreditacion[]): ResumenComercio[] {
  const map = new Map<string, ResumenComercio>();
  for (const l of lotes) {
    const pay = l.tasaPaywayMonto + (l.costoPaywayPagoUnico ?? 0);
    const comisionPlataforma = l.tasaPropiaMonto;
    const contra = l.contracargoMonto ?? 0;
    // Lo ya acreditado o cancelado no está pendiente.
    const pendiente = l.estado !== "Acreditado" && l.estado !== "Cancelado";
    const prev = map.get(l.comercioId);
    if (!prev) {
      map.set(l.comercioId, {
        comercio: nombreComercio(l),
        legajo: legajoComercio(l),
        comercioId: l.comercioId,
        cantidadLotes: 1,
        cantidadOps: l.cantidadOperaciones,
        totalBruto: l.importeBruto,
        totalImpuestos: l.impuestos,
        totalPayWay: pay,
        totalPropio: comisionPlataforma,
        totalContracargo: contra,
        totalFinal: l.importeNeto,
        pendienteAcreditar: pendiente ? l.importeNeto : 0,
        pendienteImpuestos: pendiente ? l.impuestos : 0,
      });
    } else {
      prev.cantidadLotes += 1;
      prev.cantidadOps += l.cantidadOperaciones;
      prev.totalBruto += l.importeBruto;
      prev.totalImpuestos += l.impuestos;
      prev.totalPayWay += pay;
      prev.totalPropio += comisionPlataforma;
      prev.totalContracargo += contra;
      prev.totalFinal += l.importeNeto;
      if (pendiente) {
        prev.pendienteAcreditar += l.importeNeto;
        prev.pendienteImpuestos += l.impuestos;
      }
    }
  }
  return Array.from(map.values());
}

function montoCsv(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

function celdaCsv(v: string | number): string {
  const s = String(v);
  return s.includes(";") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}

const HEADERS_CSV = [
  "Código",
  "Fecha estimada",
  "Fecha cobro real",
  "Comercio",
  "Legajo",
  "Bandera",
  "Cuotas",
  "Ops",
  "Importe bruto",
  "Descuentos",
  "Importe a acreditar",
  "Estado",
];

/** CSV (`;`, CRLF, con BOM para Excel) de la exportación de lotes. */
export function lotesACsv(rows: LoteAcreditacion[]): string {
  const lines: string[] = [HEADERS_CSV.join(";")];
  for (const l of rows) {
    const cuotas = l.cuotas != null ? `${l.cuotas}c` : "1c";
    lines.push(
      [
        l.codigo,
        l.fecha,
        l.fechaCobroReal ?? "",
        nombreComercio(l, ""),
        legajoComercio(l),
        l.bandera,
        cuotas,
        l.cantidadOperaciones,
        montoCsv(l.importeBruto),
        montoCsv(totalDescuentos(l)),
        montoCsv(l.importeNeto),
        l.estado,
      ]
        .map(celdaCsv)
        .join(";"),
    );
  }
  // BOM para que Excel detecte el encoding y respete acentos.
  return "﻿" + lines.join("\r\n");
}

/** Mensaje del toast tras subir el CSV de Payway. */
export function mensajeCsvCargado(r: { aplicados: number; sinMatch: number }): {
  tipo: "success" | "warning";
  texto: string;
} {
  if (r.aplicados <= 0) {
    return {
      tipo: "warning",
      texto: "Ningún renglón del archivo matcheó contra lotes Programado.",
    };
  }
  const sinMatch = r.sinMatch > 0;
  const texto =
    r.aplicados === 1
      ? `Lote pasado a Pendiente.${sinMatch ? ` ${r.sinMatch} renglón(es) sin match siguen en Programado.` : ""}`
      : `${r.aplicados} lotes pasados a Pendiente.${sinMatch ? ` ${r.sinMatch} renglón(es) sin match.` : ""}`;
  return { tipo: "success", texto };
}
