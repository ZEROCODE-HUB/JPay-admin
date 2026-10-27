import type { ApiUsuario, ApiUsuarioInput, EstadoApiUsuario } from "@/lib/api/types";

export type UsuarioForm = {
  codigoUsuarioApi: string;
  usuario: string;
  nombreCompleto: string;
  estado: EstadoApiUsuario;
};

/** Valores iniciales del formulario (vacío para alta, datos del usuario para edición). */
export function usuarioFormInicial(usuario: ApiUsuario | null): UsuarioForm {
  return {
    codigoUsuarioApi: usuario?.codigoUsuarioApi ?? "",
    usuario: usuario?.usuario ?? "",
    nombreCompleto: usuario?.nombreCompleto ?? "",
    estado: usuario?.estado ?? "Pendiente Validación",
  };
}

/** El formulario es válido si código, usuario y nombre no están vacíos. */
export function usuarioFormValido(form: UsuarioForm): boolean {
  return !(
    form.codigoUsuarioApi.trim() === "" ||
    form.usuario.trim() === "" ||
    form.nombreCompleto.trim() === ""
  );
}

/** Payload para crear/actualizar a partir del formulario. */
export function usuarioFormAInput(form: UsuarioForm): Required<ApiUsuarioInput> {
  return {
    codigoUsuarioApi: form.codigoUsuarioApi,
    usuario: form.usuario,
    nombreCompleto: form.nombreCompleto,
    estado: form.estado,
  };
}
