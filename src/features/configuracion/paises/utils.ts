import { toast } from "sonner";
import type { CobroComision, ConfiguracionPagos, ModeloFondos } from "@/lib/api/paises";
import type { Modulo } from "@/shared/pais";

/** Nombre visible de cada módulo de `paises.modulos`; también arman los menús del admin y del portal. */
export const MODULOS: Record<Modulo, string> = {
  spei: "Transferencias SPEI",
  oxxo: "Efectivo OXXO",
  msi: "Meses sin intereses",
  pos: "Puntos físicos (POS)",
  cfdi: "Facturación CFDI",
  pld_mx: "PLD México",
  iibb: "Ingresos Brutos",
  debitos_creditos: "Débitos y créditos",
  bcra: "Reportes BCRA",
  afip: "AFIP",
  repet: "REPET",
  pagos_proveedor: "Cobros con Ecart Pay",
  retiros_proveedor: "Retiros desde Ecart Pay",
  payway: "Tarjetas con Payway",
  transferencias_salientes: "Transferencias BDC / Coelsa",
  transferencias_cobre: "CLABE y transferencias SPEI (Cobre)",
};

export const MODELOS_FONDOS: Record<ModeloFondos, { label: string; detalle: string }> = {
  directo: {
    label: "Directo (cuenta del comercio)",
    detalle: "Cada comercio conecta su cuenta del proveedor y cobra en ella.",
  },
  centralizado: {
    label: "Centralizado (cuenta de la plataforma)",
    detalle:
      "Se cobra con la cuenta de la plataforma y se le liquida al comercio. Requiere revisión regulatoria antes de producción.",
  },
};

export const COBROS_COMISION: Record<CobroComision, { label: string; detalle: string }> = {
  split_proveedor: {
    label: "Split del proveedor",
    detalle: "El proveedor separa la comisión en cada cobro (acuerdo aparte con el proveedor).",
  },
  descuento_liquidacion: {
    label: "Descuento al liquidar",
    detalle: "Se descuenta antes de pagarle al comercio. Solo en modelo centralizado.",
  },
  cobro_aparte: {
    label: "Cobro aparte",
    detalle: "Se acumula y se cobra después (payout del comercio o factura).",
  },
};

export type ErroresConfiguracion = Partial<
  Record<"cobroComision" | "comisionPct" | "comisionFija" | "ivaComisionPct", string>
>;

/** Mismas reglas que los CHECK de `configuracion_pagos`. */
export function validarConfiguracion(c: ConfiguracionPagos): ErroresConfiguracion {
  const e: ErroresConfiguracion = {};
  if (c.cobroComision === "descuento_liquidacion" && c.modeloFondos !== "centralizado") {
    e.cobroComision = "El descuento al liquidar solo aplica al modelo centralizado.";
  }
  if (!Number.isFinite(c.comisionPct) || c.comisionPct < 0 || c.comisionPct >= 100) {
    e.comisionPct = "Entre 0 y 99.99.";
  }
  if (!Number.isFinite(c.comisionFija) || c.comisionFija < 0)
    e.comisionFija = "No puede ser negativa.";
  if (!Number.isFinite(c.ivaComisionPct) || c.ivaComisionPct < 0 || c.ivaComisionPct >= 100) {
    e.ivaComisionPct = "Entre 0 y 99.99.";
  }
  return e;
}

const redondear = (n: number) => Math.round(n * 100) / 100;

/** Comisión de la plataforma sobre un cobro de `monto`, con su IVA. */
export function calcularComision(
  c: Pick<ConfiguracionPagos, "comisionPct" | "comisionFija" | "ivaComisionPct">,
  monto: number,
): { comision: number; iva: number; total: number } {
  const comision = redondear((monto * c.comisionPct) / 100 + c.comisionFija);
  const iva = redondear((comision * c.ivaComisionPct) / 100);
  return { comision, iva, total: redondear(comision + iva) };
}

/** Toast de error de una mutación de esta pantalla. */
export const avisarError = (e: unknown) =>
  toast.error(e instanceof Error ? e.message : "No se pudo guardar el cambio");
