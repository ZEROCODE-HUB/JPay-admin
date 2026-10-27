import type { AmbitoImpuesto, EstadoImpuesto, Impuesto, TipoImpuesto } from "@/lib/api/types";

export const PAGE_SIZE = 10;

export const TIPOS_IMPUESTO: TipoImpuesto[] = ["Porcentaje", "Fijo", "Otro"];

export type TabAmbito = "externos" | "internos";

export type ImpuestoForm = {
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: TipoImpuesto;
  monto: string;
  estado: EstadoImpuesto;
  ambito: AmbitoImpuesto;
};

/** Ámbito de una fila; las que no tienen se consideran Externas. */
export function ambitoDe(row: Pick<Impuesto, "ambito">): AmbitoImpuesto {
  return row.ambito ?? "Externo";
}

/** Filas de la pestaña elegida (se filtra sobre la página ya cargada). */
export function filtrarPorAmbito<T extends Pick<Impuesto, "ambito">>(
  rows: T[],
  tab: TabAmbito,
): T[] {
  const target: AmbitoImpuesto = tab === "internos" ? "Interno" : "Externo";
  return rows.filter((r) => ambitoDe(r) === target);
}

/** Cantidad de filas externas e internas de la página cargada. */
export function contarPorAmbito(rows: Pick<Impuesto, "ambito">[]) {
  return {
    externos: rows.filter((r) => ambitoDe(r) === "Externo").length,
    internos: rows.filter((r) => ambitoDe(r) === "Interno").length,
  };
}

/** Valores iniciales del formulario (vacío o a partir del impuesto a editar). */
export function formInicial(impuesto: Impuesto | null): ImpuestoForm {
  return {
    codigo: impuesto?.codigo ?? "",
    nombre: impuesto?.nombre ?? "",
    descripcion: impuesto?.descripcion ?? "",
    tipo: impuesto?.tipo ?? "Porcentaje",
    monto: impuesto?.monto === null || impuesto?.monto === undefined ? "" : String(impuesto.monto),
    estado: impuesto?.estado ?? "Activo",
    ambito: (impuesto?.ambito as AmbitoImpuesto) ?? "Externo",
  };
}

/** "Otro" no lleva monto; Porcentaje y Fijo sí. */
export function necesitaMonto(tipo: TipoImpuesto): boolean {
  return tipo !== "Otro";
}

export function montoNegativo(monto: string): boolean {
  return monto.trim() !== "" && Number(monto) < 0;
}

/** Código y nombre obligatorios; monto obligatorio y no negativo si el tipo lo lleva. */
export function esImpuestoFormValido(form: ImpuestoForm): boolean {
  const montoValido =
    !necesitaMonto(form.tipo) || (form.monto.trim() !== "" && Number(form.monto) >= 0);
  return form.codigo.trim() !== "" && form.nombre.trim() !== "" && montoValido;
}

/** Fila a guardar a partir del formulario. */
export function impuestoPayload(form: ImpuestoForm) {
  return {
    codigo: form.codigo,
    nombre: form.nombre,
    descripcion: form.descripcion || null,
    tipo: form.tipo,
    monto: necesitaMonto(form.tipo) ? Number(form.monto) : null,
    estado: form.estado,
    ambito: form.ambito,
  };
}

/** El error de guardar es por código repetido (unique violation). */
export function esErrorDuplicado(e: { code?: string | null; message: string }): boolean {
  return e.code === "23505" || /duplicat|unique/i.test(e.message);
}
