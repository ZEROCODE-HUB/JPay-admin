import type { ApiEndpoint, EstadoEndpoint, GrupoEndpoint, MetodoHttp } from "@/lib/api/types";

export type EndpointForm = {
  nombre: string;
  path: string;
  metodo: MetodoHttp;
  descripcion: string;
  grupo: GrupoEndpoint;
  estado: EstadoEndpoint;
  rec: boolean;
};

/** Valores iniciales del formulario (vacío para alta, datos del endpoint para edición). */
export function endpointFormInicial(endpoint: ApiEndpoint | null): EndpointForm {
  return {
    nombre: endpoint?.nombre ?? "",
    path: endpoint?.path ?? "",
    metodo: endpoint?.metodo ?? "GET",
    descripcion: endpoint?.descripcion ?? "",
    grupo: endpoint?.grupo ?? "Autenticación",
    estado: endpoint?.estado ?? "Habilitado",
    rec: endpoint?.rec ?? false,
  };
}

/** El formulario es válido si nombre y path no están vacíos. */
export function endpointFormValido(form: EndpointForm): boolean {
  return !(form.nombre.trim() === "" || form.path.trim() === "");
}
