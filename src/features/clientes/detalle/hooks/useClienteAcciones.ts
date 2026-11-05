import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  activarCliente,
  aprobarDocumentacionCliente,
  deshabilitarCliente,
  eliminarCliente,
  reactivarCliente,
  suspenderCliente,
} from "@/lib/api/clientes";
import type { Cliente } from "@/lib/api/types";
import type { ClienteDetalleUi } from "./useClienteDetalleUi";

export type AccionCliente =
  "aprobar" | "activar" | "suspender" | "reactivar" | "deshabilitar" | "eliminar";

/** Cambios de estado del cliente (homologado). */
export function useClienteAcciones(ui: ClienteDetalleUi) {
  const queryClient = useQueryClient();
  const { setConfirmAction } = ui;

  const cambiarEstadoHomologado = async (c: Cliente, accion: AccionCliente) => {
    try {
      let res: { ok: boolean; motivo?: string } = { ok: false, motivo: "" };
      if (accion === "aprobar") res = await aprobarDocumentacionCliente(c);
      else if (accion === "activar") res = await activarCliente(c);
      else if (accion === "suspender") res = await suspenderCliente(c);
      else if (accion === "reactivar") res = await reactivarCliente(c);
      else if (accion === "deshabilitar") res = await deshabilitarCliente(c);
      else if (accion === "eliminar") res = await eliminarCliente(c);
      if (!res.ok) {
        setConfirmAction({
          title: "No se pudo actualizar",
          message: res.motivo ?? "No se pudo completar",
          confirmLabel: "Cerrar",
          variant: "danger",
          onConfirm: () => setConfirmAction(null),
        });
        toast.error(res.motivo ?? "No se pudo completar");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      queryClient.invalidateQueries({ queryKey: ["clientes", "legajo", c.legajo] });
      toast.success("Estado actualizado");
    } catch (e) {
      setConfirmAction({
        title: "No se pudo actualizar",
        message: (e as Error).message,
        confirmLabel: "Cerrar",
        variant: "danger",
        onConfirm: () => setConfirmAction(null),
      });
    }
  };

  return { cambiarEstadoHomologado };
}
