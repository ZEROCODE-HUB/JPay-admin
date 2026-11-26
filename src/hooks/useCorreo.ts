import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEstadoCorreo,
  guardarCorreo,
  probarCorreo,
  quitarClaveCorreo,
  type EstadoCorreo,
} from "@/lib/api/correo";

const KEY = ["correo"] as const;

/** Estado y acciones del correo saliente (Resend). */
export function useCorreo() {
  const qc = useQueryClient();
  const onSuccess = (e: EstadoCorreo) => qc.setQueryData(KEY, e);
  return {
    estado: useQuery({ queryKey: KEY, queryFn: getEstadoCorreo }),
    guardar: useMutation({ mutationFn: guardarCorreo, onSuccess }),
    quitarClave: useMutation({ mutationFn: quitarClaveCorreo, onSuccess }),
    probar: useMutation({ mutationFn: probarCorreo, onSuccess }),
  };
}
