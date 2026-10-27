import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Ban, CheckCircle, Eye, Trash2, XCircle } from "lucide-react";
import type { ActionItem } from "@/components/actions-dropdown";
import { deleteEnlace, updateEnlaceEstado, type EnlacePago } from "@/lib/api/enlaces-pago";
import { useCan } from "@/lib/permissions";
import { accionesDisponibles, etiquetaEnlace } from "../utils";

type Confirmacion = {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "default" | "danger";
  onConfirm: () => void;
};

/** Menú de acciones (transiciones de estado / eliminar), confirmaciones y detalle. */
export function useEnlacesAcciones() {
  const qc = useQueryClient();
  const { can } = useCan();
  const puedeModificar = can("modificar", "comercios");
  const puedeBorrar = can("borrar", "comercios");

  const [detail, setDetail] = useState<EnlacePago | null>(null);
  const [confirm, setConfirm] = useState<Confirmacion | null>(null);

  const avisarError = (title: string, e: unknown) =>
    setConfirm({
      title,
      message: (e as Error).message,
      confirmLabel: "Cerrar",
      variant: "danger",
      onConfirm: () => setConfirm(null),
    });

  const cambiar = async (row: EnlacePago, nuevo: string) => {
    try {
      await updateEnlaceEstado(row.id, nuevo);
      qc.invalidateQueries({ queryKey: ["enlaces-pago"] });
    } catch (e) {
      avisarError("No se pudo actualizar", e);
    }
  };
  const eliminar = async (row: EnlacePago) => {
    try {
      await deleteEnlace(row.id);
      qc.invalidateQueries({ queryKey: ["enlaces-pago"] });
    } catch (e) {
      avisarError("No se pudo eliminar", e);
    }
  };

  /** Abre la confirmación y, al aceptar, la cierra y ejecuta `accion`. */
  const confirmar = (c: Omit<Confirmacion, "onConfirm">, accion: () => Promise<void>) =>
    setConfirm({
      ...c,
      onConfirm: () => {
        setConfirm(null);
        void accion();
      },
    });

  const getActions = (r: EnlacePago): ActionItem[] => {
    const disp = accionesDisponibles(r.estado);
    const nombre = etiquetaEnlace(r);
    const items: ActionItem[] = [{ label: "Ver detalles", icon: Eye, onClick: () => setDetail(r) }];
    if (disp.activar)
      items.push({
        label: "Activar",
        icon: CheckCircle,
        disabled: !puedeModificar,
        onClick: () =>
          confirmar(
            {
              title: "Activar enlace",
              message: `¿Activar ${nombre}? El enlace quedará cobrable (aún no pagado).`,
              confirmLabel: "Activar",
              variant: "default",
            },
            () => cambiar(r, "Activado"),
          ),
      });
    if (disp.desactivar)
      items.push({
        label: "Desactivar",
        icon: Ban,
        disabled: !puedeModificar,
        variant: "default" as const,
        onClick: () =>
          confirmar(
            {
              title: "Desactivar enlace",
              message: `¿Desactivar ${nombre}? El comercio desactiva el link.`,
              confirmLabel: "Desactivar",
              variant: "danger",
            },
            () => cambiar(r, "Desactivado"),
          ),
      });
    if (disp.pagado)
      items.push({
        label: "Marcar pagado",
        icon: CheckCircle,
        disabled: !puedeModificar,
        onClick: () =>
          confirmar(
            {
              title: "Marcar como pagado",
              message: `¿Marcar ${nombre} como Pagado? Se habilitará detalle de método/tarjeta/cuotas.`,
              confirmLabel: "Pagado",
              variant: "default",
            },
            () => cambiar(r, "Pagado"),
          ),
      });
    if (disp.expirar)
      items.push({
        label: "Marcar expirado (24h)",
        icon: XCircle,
        disabled: !puedeModificar,
        variant: "danger" as const,
        onClick: () =>
          confirmar(
            {
              title: "Expirar enlace",
              message: `¿Marcar ${nombre} como Expirado? El comprador no lo abrió en 24h.`,
              confirmLabel: "Expirado",
              variant: "danger",
            },
            () => cambiar(r, "Expirado"),
          ),
      });
    if (disp.contracargo)
      items.push({
        label: "Marcar contracargo",
        icon: AlertTriangle,
        disabled: !puedeModificar,
        variant: "danger" as const,
        onClick: () =>
          confirmar(
            {
              title: "Contracargo",
              message: `¿Marcar ${nombre} como Contracargo? El comprador no acepta el gasto.`,
              confirmLabel: "Contracargo",
              variant: "danger",
            },
            () => cambiar(r, "Contracargo"),
          ),
      });
    if (disp.eliminar)
      items.push({
        label: "Eliminar",
        icon: Trash2,
        disabled: !puedeBorrar,
        variant: "danger" as const,
        onClick: () =>
          confirmar(
            {
              title: "Eliminar enlace",
              message: `¿Eliminar ${nombre}?`,
              confirmLabel: "Eliminar",
              variant: "danger",
            },
            () => eliminar(r),
          ),
      });
    return items;
  };

  return { getActions, detail, setDetail, confirm, setConfirm };
}
