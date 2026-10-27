import type {
  EstadoImpuesto,
  ImpuestoAsignacion,
  ImpuestoAsignacionInput,
  TipoImpuesto,
  TipoOperacion,
} from "@/lib/api/types";

export const PAGE_SIZE = 10;

/** Legajo de cliente: tres letras, guion y CUIT de 11 dígitos (ej. LPF-20111111111). */
export const LEGAJO_RE = /^[A-Z]{3}-\d{11}$/;

export type AsignacionForm = {
  clienteLegajo: string;
  impuestoId: string;
  monto: string;
  tipo: TipoImpuesto;
  estado: EstadoImpuesto;
  tipoOperacion: TipoOperacion | "";
};

/**
 * Valores iniciales del formulario. El monto es obligatorio y arranca en "0"
 * cuando la asignación no tiene uno.
 */
export function formInicial(asignacion: ImpuestoAsignacion | null): AsignacionForm {
  return {
    clienteLegajo: asignacion?.clienteLegajo ?? "",
    impuestoId: asignacion?.impuestoId ?? "",
    monto: String(asignacion?.monto ?? 0),
    tipo: asignacion?.tipo ?? "Porcentaje",
    estado: asignacion?.estado ?? "Activo",
    tipoOperacion: asignacion?.tipoOperacion ?? "",
  };
}

export function esLegajoValido(legajo: string): boolean {
  return LEGAJO_RE.test(legajo.trim());
}

/** Monto obligatorio, numérico y no negativo. */
export function esMontoValido(monto: string): boolean {
  return monto.trim() !== "" && !isNaN(Number(monto)) && Number(monto) >= 0;
}

/** En el alta el legajo tiene que tener formato válido; en la edición no se toca. */
export function esAsignacionValida(form: AsignacionForm, esEdicion: boolean): boolean {
  return (
    form.clienteLegajo.trim() !== "" &&
    (!esEdicion ? esLegajoValido(form.clienteLegajo) : true) &&
    form.impuestoId !== "" &&
    esMontoValido(form.monto)
  );
}

/**
 * Legajo a guardar en el form según lo tipeado en el buscador: el legajo en
 * mayúsculas si tiene formato válido, "" si se borró todo, o `null` (no tocar).
 */
export function legajoDesdeBusqueda(texto: string): string | null {
  if (/^[A-Z]{3}-\d{11}$/i.test(texto.trim())) return texto.toUpperCase();
  if (!texto.trim()) return "";
  return null;
}

/** Al elegir un impuesto se precargan su monto (0 si no tiene) y su tipo. */
export function aplicarImpuesto(
  form: AsignacionForm,
  impuestoId: string,
  imp: { monto: number | null; tipo: string } | undefined,
): AsignacionForm {
  return {
    ...form,
    impuestoId,
    monto: imp ? String(imp.monto ?? 0) : form.monto,
    tipo: imp ? (imp.tipo as TipoImpuesto) : form.tipo,
  };
}

function tipoOperacionDe(form: AsignacionForm): TipoOperacion | null {
  return form.tipoOperacion === "" ? null : form.tipoOperacion;
}

/** Fila a insertar en el alta. */
export function asignacionCreatePayload(form: AsignacionForm): ImpuestoAsignacionInput {
  return {
    cliente_legajo: form.clienteLegajo.trim(),
    impuesto_id: form.impuestoId,
    tipo: form.tipo,
    monto: Number(form.monto),
    estado: form.estado,
    tipo_operacion: tipoOperacionDe(form),
  };
}

/** Cambios a guardar en la edición. */
export function asignacionUpdatePayload(form: AsignacionForm): Partial<ImpuestoAsignacionInput> {
  return {
    impuesto_id: form.impuestoId || undefined,
    tipo: form.tipo,
    monto: Number(form.monto),
    estado: form.estado,
    tipo_operacion: tipoOperacionDe(form),
  };
}

/** El error de guardar es porque el legajo no existe (foreign key). */
export function esErrorFk(e: { code?: string | null; message: string }): boolean {
  return e.code === "23503" || /foreign key/i.test(e.message);
}
