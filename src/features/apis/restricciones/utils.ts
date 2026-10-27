import type { ApiRestriccion, EstadoRestriccion } from "@/lib/api/types";

export type RestriccionForm = {
  apiUsuarioId: string;
  estado: EstadoRestriccion;
  fechaExpiracion: string; // YYYY-MM-DD
};

/** Valores iniciales del formulario (alta o edición). */
export function restriccionFormInicial(restriccion: ApiRestriccion | null): RestriccionForm {
  return {
    apiUsuarioId: restriccion?.apiUsuarioId ?? "",
    estado: restriccion?.estado ?? "Restringiendo",
    fechaExpiracion: restriccion?.fechaExpiracion ?? "",
  };
}

/** El formulario se puede guardar solo con usuario y fecha de expiración. */
export function restriccionFormValido(form: RestriccionForm): boolean {
  return Boolean(form.apiUsuarioId && form.fechaExpiracion);
}
