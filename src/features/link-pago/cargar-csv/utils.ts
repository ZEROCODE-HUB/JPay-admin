// Lógica pura de la carga del archivo de liquidación de Payway (sin React ni Supabase).
// El parseo de las columnas del archivo vive en `@/lib/liquidaciones/parse`; acá está
// lo que el modal hace con ese resultado: armar las entradas del cálculo, validar antes
// de confirmar y construir la liquidación que se manda a la RPC.

import { formatMoney } from "@/shared/format";
import type { Establecimiento } from "@/lib/api/liquidaciones";
import type { LiquidacionAplicada } from "@/lib/api/lotes";
import type { ResultadoRetenciones } from "@/lib/api/retenciones-lote";
import type { LoteAcreditacion } from "@/lib/api/types";
import type {
  EstadoRenglon,
  PreviewAcreditacion,
  SitioLookup,
  TotalesAcreditacion,
} from "@/lib/liquidaciones/acreditacion";
import type { EstablecimientoEntrada, LoteMatcheado } from "@/lib/liquidaciones/match-general";
import type { RenglonLiquidacion } from "@/lib/liquidaciones/parse";

export type ResultadoCargaCsv = {
  aplicados: number;
  sinMatch: number;
};

export type MatchConPreview = LoteMatcheado & { preview: PreviewAcreditacion };

export type PreviewGeneral = {
  matches: MatchConPreview[];
  sinMatch: RenglonLiquidacion[];
};

export type Tono = "success" | "warn" | "danger" | "neutral";

/** Etiqueta y tono del badge para cada estado de renglón del preview per-lote. */
export const ETIQUETA_ESTADO: Record<EstadoRenglon, { texto: string; tone: Tono }> = {
  aplicado: { texto: "Aplicar", tone: "success" },
  diferencia: { texto: "Diferencia", tone: "warn" },
  sin_establecimiento: { texto: "Sin mapear", tone: "warn" },
  sin_movimiento: { texto: "Sin movimiento", tone: "neutral" },
  error_formato: { texto: "Formato", tone: "danger" },
  otro_lote: { texto: "Otro lote", tone: "neutral" },
  excluido: { texto: "Excluido", tone: "neutral" },
};

const nombreComercio = (c: { nombreComercio: string | null; usuario?: string | null } | null) =>
  c?.nombreComercio ?? c?.usuario ?? "";

/**
 * Convierte el mapa de establecimientos de la base a la entrada del cálculo,
 * resolviendo el nombre del comercio desde el join (siempre string).
 */
export function mapearEstablecimientos(
  rows: Establecimiento[],
): (EstablecimientoEntrada & { comercioNombre: string })[] {
  return rows.map((e) => ({
    establecimiento: e.establecimiento,
    marca: e.marca,
    comercioId: e.comercioId,
    vigenteHasta: e.vigenteHasta,
    comercioNombre: nombreComercio(e.comercio),
  }));
}

/**
 * Fallback por `site_id`: cuando el mapa de establecimientos no resuelve un renglón,
 * se busca el comercio por `comercios.site_id`. En per-lote sale del lote; en modo
 * general, de los lotes Programado cargados.
 */
export function construirSitios(
  modoPerLote: boolean,
  lote: LoteAcreditacion | null | undefined,
  programados: LoteAcreditacion[] | null,
): SitioLookup[] {
  const out: SitioLookup[] = [];
  if (modoPerLote && lote?.comercio?.siteId) {
    out.push({
      sitioId: lote.comercio.siteId,
      comercioId: lote.comercioId,
      comercioNombre: nombreComercio(lote.comercio),
    });
  }
  if (!modoPerLote) {
    for (const l of programados ?? []) {
      if (l.comercio?.siteId) {
        out.push({
          sitioId: l.comercio.siteId,
          comercioId: l.comercioId,
          comercioNombre: nombreComercio(l.comercio),
        });
      }
    }
  }
  return out;
}

/** IIBB: si el cliente lo tiene asignado lo calcula el motor; si no, el valor manual. */
export function iibbMontoFinal(
  retenciones: ResultadoRetenciones | null,
  iibbManual: number,
): number {
  return retenciones && retenciones.iibb.asignado ? retenciones.iibb.monto : iibbManual;
}

/**
 * Importe a acreditar. Con retenciones del motor se recalcula sobre el neto del CSV
 * (redondeado a centavos y nunca negativo); sin ellas se usa el cálculo local.
 */
export function importeNetoFinal(
  totales: TotalesAcreditacion,
  retenciones: ResultadoRetenciones | null,
  iibbMonto: number,
): number {
  if (!retenciones) return totales.importeNeto;
  return Math.max(
    0,
    Math.round(
      (totales.netoCsv -
        totales.comisionPropia -
        totales.comisionCierre -
        retenciones.debitoCredito.monto -
        retenciones.iva.monto -
        iibbMonto +
        Number.EPSILON) *
        100,
    ) / 100,
  );
}

/** Liquidación que se graba en el lote a partir del preview. */
export function liquidacionDePreview(
  p: PreviewAcreditacion,
  tasaPropiaPct: number,
  comisionCierrePct: number,
  retenciones: ResultadoRetenciones | null,
  iibbMonto: number,
): LiquidacionAplicada {
  return {
    comisionPropiaPct: tasaPropiaPct,
    comisionPropiaMonto: p.totales.comisionPropia,
    comisionCierreLotePct: comisionCierrePct,
    comisionCierreLoteMonto: p.totales.comisionCierre,
    // Si la RPC devolvió algo, lo usamos. Si no, caemos al cálculo local
    // (puede no respetar exenciones).
    debitoCreditoMonto: retenciones
      ? retenciones.debitoCredito.monto
      : p.totales.retencionDebitoCredito,
    ivaMonto: retenciones ? retenciones.iva.monto : p.totales.retencionIva,
    iibbMonto,
    importeNeto: importeNetoFinal(p.totales, retenciones, iibbMonto),
  };
}

/**
 * fecha_cobro_real: la fecha más antigua de los renglones aplicados al lote
 * (en archivos diarios es la misma para todos). null si ninguno trae fecha.
 */
export function fechaCobroRealPara(rs: Pick<RenglonLiquidacion, "fecha">[]): string | null {
  const fechas = rs
    .map((r) => r.fecha)
    .filter(Boolean)
    .sort();
  return fechas[0] ?? null;
}

/** Pre-flight antes de mandar a la RPC. */
export function validarCarga(args: {
  modoPerLote: boolean;
  lote: LoteAcreditacion | null | undefined;
  previewPerLote: PreviewAcreditacion | null;
  previewGeneral: PreviewGeneral | null;
}): { ok: true } | { ok: false; msg: string } {
  const { modoPerLote, lote, previewPerLote, previewGeneral } = args;
  if (modoPerLote) {
    if (!lote) return { ok: false, msg: "Sin lote objetivo." };
    if (!previewPerLote || previewPerLote.aplicables.length === 0) {
      return { ok: false, msg: "Ningun renglon del archivo corresponde a este lote." };
    }
  } else if (!previewGeneral || previewGeneral.matches.length === 0) {
    return { ok: false, msg: "El archivo no hizo match con ningun lote Programado." };
  }
  return { ok: true };
}

/** Texto del botón de confirmar según el modo y lo que matcheó. */
export function submitLabelCarga(
  modoPerLote: boolean,
  previewPerLote: PreviewAcreditacion | null,
  previewGeneral: PreviewGeneral | null,
): string {
  if (modoPerLote) {
    return previewPerLote && previewPerLote.aplicables.length > 0
      ? `Pasar a Pendiente (${formatMoney(previewPerLote.totales.importeNeto)})`
      : "Pasar a Pendiente";
  }
  if (previewGeneral && previewGeneral.matches.length > 0) {
    const n = previewGeneral.matches.length;
    return `Pasar a Pendiente (${n} lote${n === 1 ? "" : "s"})`;
  }
  return "Pasar a Pendiente";
}

/** Número de un input libre: acepta coma decimal; vacío o inválido = 0. */
export function numeroDeInput(v: string): number {
  return Number(v.replace(",", ".")) || 0;
}

/**
 * CSV de ejemplo con 5 contracargos simulados, en el formato que envía PayWay
 * (separador `;`, encabezados en MAYÚSCULAS, tarjetas enmascaradas y completas).
 * Sirve para probar el importador de contracargos sin un reporte real.
 */
export function csvContracargosDemo(
  fecha: Date,
  marca: string,
): { nombre: string; contenido: string } {
  const periodo = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
  const lineas: string[] = [
    `${marca} - Reporte de Alertas Tempranas de Contracargos;Periodo ${periodo};Generado ${fecha.toLocaleString("es-AR")}`,
    "ID_TRANSACCION;FECHA_DE_TRANS;MEDIO_DE_PAGO;NRO_DE_TARJETA;MONTO_DE_TRAM;CODIGO_DE_AUT;CCO_ORIGEN;CCO_MOTIVO",
    "PW-7894561;09/10/2026;Visa;****1234;1500,00;PW-TKT-88421;WEB;Desconocimiento de compra",
    "PW-7894562;08/10/2026;Mastercard;5234567890123456;2750,50;PW-TKT-88422;APP;Producto no recibido",
    "PW-7894563;07/10/2026;Amex;****0005;4200,00;PW-TKT-88423;WEB;Monto no reconocido",
    "PW-7894564;06/10/2026;Cabal;****9876;890,25;PW-TKT-88424;APP;Duplicado de cobro",
    "PW-7894565;05/10/2026;Visa;****4321;3300,00;PW-TKT-88425;WEB;Servicio no prestado",
  ];
  return {
    nombre: `contracargos_demo_${periodo}.csv`,
    contenido: "﻿" + lineas.join("\r\n"),
  };
}
