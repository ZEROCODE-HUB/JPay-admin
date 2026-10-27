import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  aprobarDocumentacionCliente,
  activarCliente,
  suspenderCliente,
  reactivarCliente,
  deshabilitarCliente,
  eliminarCliente,
  getClienteByLegajo,
} from "@/lib/api/clientes";
import { useCan } from "@/lib/permissions";
import type { AccionCliente, ConfirmAction } from "../types";

type Textos = {
  /** Toast cuando la transición se completó. */
  exito: string;
  /** Toast si la transición falló sin motivo. */
  errorToast: string;
  /** Mensaje del diálogo si la transición falló sin motivo. */
  errorMensaje: string;
};

/** Diálogo de confirmación + ejecución de transiciones de estado de un cliente. */
export function useAccionesCliente(textos: Textos) {
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const { can } = useCan();
  const puedeModificar = can("modificar", "usuarios");
  const puedeBorrar = can("borrar", "usuarios");

  const ejecutar = async (legajo: string, accion: AccionCliente) => {
    try {
      const cliente = await getClienteByLegajo(legajo);
      if (!cliente) throw new Error("Cliente no encontrado");
      let res: { ok: boolean; motivo?: string } | { ok: true } = {
        ok: false,
        motivo: "No implementado",
      };
      if (accion === "aprobar") res = await aprobarDocumentacionCliente(cliente);
      else if (accion === "activar") res = await activarCliente(cliente);
      else if (accion === "suspender") res = await suspenderCliente(cliente);
      else if (accion === "reactivar") res = await reactivarCliente(cliente);
      else if (accion === "deshabilitar") res = await deshabilitarCliente(cliente);
      else if (accion === "eliminar") res = await eliminarCliente(cliente);

      if (!res.ok) {
        const motivo = (res as { motivo?: string }).motivo;
        toast.error(motivo ?? textos.errorToast);
        setConfirmAction({
          title: "No se pudo completar",
          message: motivo ?? textos.errorMensaje,
          confirmLabel: "Cerrar",
          variant: "danger",
          onConfirm: () => setConfirmAction(null),
        });
        return;
      }
      toast.success(textos.exito);
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      setConfirmAction(null);
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(msg);
      setConfirmAction({
        title: "Error",
        message: msg,
        confirmLabel: "Cerrar",
        variant: "danger",
        onConfirm: () => setConfirmAction(null),
      });
    }
  };

  return { confirmAction, setConfirmAction, ejecutar, puedeModificar, puedeBorrar };
}
