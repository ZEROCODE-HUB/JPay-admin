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

/** Ámbito que se filtra en el servidor para la pestaña elegida. */
export function ambitoDeTab(tab: TabAmbito): AmbitoImpuesto {
  return tab === "internos" ? "Interno" : "Externo";
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
