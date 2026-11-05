import type { EstadoComision, ModalidadComision, TipoOperacion } from "@/lib/api/types";

/**
 * Parametrización de arancel por cliente y tipo de operación.
 * Modelo 1:1 con la tabla `comisiones_cliente`:
 * - `operacion`: código único de referencia (ej. "DEP-2024-001").
 * - `tipo`: categoría de la operación (4 valores fijos).
 * - `modalidad`: Porcentaje | Fijo.
 * - `porcentaje` / `montoFijo`: según modalidad.
 * - `porcentajeImpuesto`: IVA sobre la comisión que la plataforma retiene y paga (16 %).
 */
export type ConfigComision = {
  operacion: string;
  tipo: TipoOperacion;
  modalidad: ModalidadComision;
  porcentaje: number | null;
  montoFijo: number | null;
  porcentajeImpuesto: number;
  estado?: EstadoComision;
  descripcion?: string;
};

export type ParametrosCobro = {
  modalidad: ModalidadComision;
  porcentaje: number | null;
  montoFijo: number | null;
  montoOperacion: number;
};

/**
 * Calcula el monto de comisión de la plataforma para una operación.
 * - Modalidad porcentaje: comisión = montoOperación × %comisión / 100
 * - Modalidad fija (extensión futura): comisión = montoFijo
 */
export function calcularComision({
  modalidad,
  porcentaje,
  montoFijo,
  montoOperacion,
}: ParametrosCobro): number {
  if (modalidad === "Fijo") return montoFijo ?? 0;
  return montoOperacion * ((porcentaje ?? 0) / 100);
}

export type Desglose = {
  comision: number;
  impuesto: number;
  total: number;
  porcentajeImpuesto: number;
};

/**
 * Desglose del cobro al cliente:
 *   monto cobrado = comisión × (1 + impuesto%)
 * Devuelve los tres componentes por separado (Comisión / Impuesto / Total).
 * El impuesto es el que la plataforma retiene y paga por el servicio (IVA 16 %).
 */
export function calcularDesglose(comision: number, porcentajeImpuesto: number): Desglose {
  const impuesto = comision * (porcentajeImpuesto / 100);
  return { comision, impuesto, total: comision + impuesto, porcentajeImpuesto };
}

export function desgloseDesdeConfig(config: ConfigComision, montoOperacion: number): Desglose {
  const comision = calcularComision({
    modalidad: config.modalidad,
    porcentaje: config.porcentaje,
    montoFijo: config.montoFijo,
    montoOperacion,
  });
  return calcularDesglose(comision, config.porcentajeImpuesto);
}
