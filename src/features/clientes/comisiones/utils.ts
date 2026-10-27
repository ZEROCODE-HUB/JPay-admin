import { formatMoney, formatPercent } from "@/shared/format";
import { desgloseDesdeConfig, type Desglose } from "@/lib/aranceles";
import type {
  ComisionCliente,
  EstadoComision,
  ModalidadComision,
  TipoOperacion,
} from "@/lib/api/types";

export const PAGE_SIZES = [10, 20, 50];

/** En esta pantalla solo se cargan comisiones de Depósito y Retiro. */
export const TIPOS_COMISION_USUARIOS: TipoOperacion[] = ["Depósito", "Retiro"];

/** Monto de operación de referencia para el desglose de ejemplo. */
export const MONTO_OPERACION_REF = 100000;

export type Comision = {
  id: string;
  legajo: string;
  correo: string;
  cuit: string;
  tipoPersona: "fisica" | "juridica";
  operacion: string;
  tipo: TipoOperacion;
  modalidad: ModalidadComision;
  estado: EstadoComision;
  porcentaje: number | null;
  montoFijo: number | null;
  porcentajeImpuesto: number;
  descripcion: string;
  /** CVU al que aplica la comisión (null = comisión del cliente, respaldo). */
  subcuentaId: string | null;
  cvu: string | null;
};

export type ComisionDraft = {
  id?: string;
  correo: string;
  /** Legajo del cliente elegido (para listar sus CVUs). */
  legajo: string;
  cuit: string;
  tipoPersona: "fisica" | "juridica";
  /** CVU al que aplica; null = comisión del cliente (respaldo de todos sus CVUs). */
  subcuentaId: string | null;
  tipo: TipoOperacion;
  modalidad: ModalidadComision;
  porcentaje: number | null;
  montoFijo: number | null;
  porcentajeImpuesto: number;
  /** Solo puede haber una Habilitada por CVU (o por cliente) y tipo. */
  estado: EstadoComision;
  descripcion: string;
};

/** Fila de la tabla a partir de la comisión de la API ("—" si falta el cliente). */
export function comisionDesdeApi(c: ComisionCliente): Comision {
  return {
    id: c.id,
    legajo: c.cliente?.legajo ?? "—",
    correo: c.cliente?.correo ?? "—",
    cuit: c.cliente?.cuit ?? "—",
    tipoPersona: c.cliente?.tipoPersona ?? "fisica",
    operacion: c.operacion,
    tipo: c.tipo,
    modalidad: c.modalidad,
    estado: c.estado,
    porcentaje: c.porcentaje,
    montoFijo: c.montoFijo,
    porcentajeImpuesto: c.porcentajeImpuesto,
    descripcion: c.descripcion ?? "",
    subcuentaId: c.subcuentaId,
    cvu: c.subcuenta?.cbu ?? null,
  };
}

/** Borrador de una comisión nueva: Depósito, 1 % + 21 % de IVA, habilitada. */
export function draftVacio(): ComisionDraft {
  return {
    correo: "",
    legajo: "",
    cuit: "",
    tipoPersona: "fisica",
    subcuentaId: null,
    tipo: "Depósito",
    modalidad: "Porcentaje",
    porcentaje: 1,
    montoFijo: null,
    porcentajeImpuesto: 21,
    estado: "Habilitado",
    descripcion: "",
  };
}

/** Borrador para editar una comisión existente. */
export function draftDesdeComision(c: Comision): ComisionDraft {
  return {
    id: c.id,
    correo: c.correo,
    legajo: c.legajo === "—" ? "" : c.legajo,
    cuit: c.cuit,
    tipoPersona: c.tipoPersona,
    subcuentaId: c.subcuentaId,
    tipo: c.tipo,
    modalidad: c.modalidad,
    porcentaje: c.porcentaje,
    montoFijo: c.montoFijo,
    porcentajeImpuesto: c.porcentajeImpuesto,
    estado: c.estado,
    descripcion: c.descripcion,
  };
}

/** Cobro de ejemplo (comisión + IVA) sobre MONTO_OPERACION_REF. */
export function desgloseDe(
  c: Pick<Comision, "tipo" | "modalidad" | "porcentaje" | "montoFijo" | "porcentajeImpuesto">,
): Desglose {
  return desgloseDesdeConfig(
    {
      operacion: c.tipo,
      tipo: c.tipo,
      modalidad: c.modalidad,
      porcentaje: c.porcentaje,
      montoFijo: c.montoFijo,
      porcentajeImpuesto: c.porcentajeImpuesto,
    },
    MONTO_OPERACION_REF,
  );
}

/** Configuración de la comisión: monto fijo en $ o porcentaje. */
export function configLabel(c: Pick<Comision, "modalidad" | "montoFijo" | "porcentaje">): string {
  return c.modalidad === "Fijo" ? formatMoney(c.montoFijo ?? 0) : formatPercent(c.porcentaje ?? 0);
}

/**
 * Código de operación de una comisión nueva (único por cliente):
 * RET|DEP - CVU|CTA - timestamp.
 */
export function codigoOperacionNuevo(
  draft: Pick<ComisionDraft, "tipo" | "subcuentaId">,
  ahora: number,
): string {
  return `${draft.tipo === "Retiro" ? "RET" : "DEP"}-${draft.subcuentaId ? "CVU" : "CTA"}-${ahora}`;
}
