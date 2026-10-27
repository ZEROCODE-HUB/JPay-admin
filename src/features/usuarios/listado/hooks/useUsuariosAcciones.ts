import { useNavigate } from "@tanstack/react-router";
import {
  Eye,
  XCircle,
  RotateCcw,
  Inbox,
  ShieldCheck,
  Ban,
  Trash2,
  CheckCircle,
} from "lucide-react";
import type { ActionItem } from "@/components/actions-dropdown";
import { normalizarEstado } from "@/lib/cliente-estados";
import { useAccionesCliente } from "../../comun/hooks/useAccionesCliente";
import type { Usuario } from "../utils";

/** Menú de acciones por fila + diálogo de confirmación de Personas físicas. */
export function useUsuariosAcciones() {
  const navigate = useNavigate();
  const { confirmAction, setConfirmAction, ejecutar, puedeModificar, puedeBorrar } =
    useAccionesCliente({
      exito: "Estado actualizado correctamente",
      errorToast: "No se pudo completar la acción",
      errorMensaje: "No se pudo completar la acción",
    });

  const getActions = (row: Usuario): ActionItem[] => {
    const norm = normalizarEstado(row.estadoRaw);
    const items: ActionItem[] = [
      {
        label: "Ver / editar ficha",
        icon: Eye,
        onClick: () =>
          navigate({ to: "/admin/general/usuarios/$legajo", params: { legajo: row.legajo } }),
      },
      {
        label: "Asignar / gestionar CVU",
        icon: ShieldCheck,
        disabled: !puedeModificar,
        onClick: () =>
          navigate({
            to: "/admin/general/usuarios/$legajo",
            params: { legajo: row.legajo },
            search: { tab: "cvu" },
          }),
      },
      {
        label: "Ver historial de movimientos",
        icon: Inbox,
        onClick: () =>
          navigate({ to: "/admin/general/movimientos", search: { legajo: row.legajo } }),
      },
    ];

    if (norm === "registrado") {
      items.push({
        label: "Preactivar (aprobar documentación)",
        icon: ShieldCheck,
        disabled: !puedeModificar,
        onClick: () =>
          setConfirmAction({
            title: "Aprobar documentación",
            message: `¿Aprobar la documentación de ${row.nombres}? Pasará a Preactivado.`,
            confirmLabel: "Aprobar",
            variant: "default",
            onConfirm: () => ejecutar(row.legajo, "aprobar"),
          }),
      });
    }
    if (norm === "preactivado") {
      items.push({
        label: "Activar",
        icon: CheckCircle,
        disabled: !puedeModificar,
        onClick: () =>
          setConfirmAction({
            title: "Activar usuario",
            message: `¿Activar a ${row.nombres}? Requiere CVU y comisión cargados.`,
            confirmLabel: "Activar",
            variant: "default",
            onConfirm: () => ejecutar(row.legajo, "activar"),
          }),
      });
    }
    if (norm === "activado") {
      items.push({
        label: "Suspender",
        icon: XCircle,
        disabled: !puedeModificar,
        variant: "danger" as const,
        onClick: () =>
          setConfirmAction({
            title: "Suspender usuario",
            message: `¿Suspender a ${row.nombres}? Se conservará su historial.`,
            confirmLabel: "Suspender",
            variant: "danger",
            onConfirm: () => ejecutar(row.legajo, "suspender"),
          }),
      });
    }
    if (norm === "suspendido") {
      items.push({
        label: "Reactivar",
        icon: RotateCcw,
        disabled: !puedeModificar,
        onClick: () =>
          setConfirmAction({
            title: "Reactivar usuario",
            message: `¿Reactivar a ${row.nombres}?`,
            confirmLabel: "Reactivar",
            variant: "default",
            onConfirm: () => ejecutar(row.legajo, "reactivar"),
          }),
      });
    }
    if (norm !== "deshabilitado" && norm !== "eliminado") {
      items.push({
        label: "Deshabilitar",
        icon: Ban,
        disabled: !puedeModificar,
        variant: "danger" as const,
        onClick: () =>
          setConfirmAction({
            title: "Deshabilitar usuario",
            message: `¿Deshabilitar a ${row.nombres}? Se cancelará su CVU y se conservará el historial (auditoría BCRA).`,
            confirmLabel: "Deshabilitar",
            variant: "danger",
            onConfirm: () => ejecutar(row.legajo, "deshabilitar"),
          }),
      });
      items.push({
        label: "Eliminar",
        icon: Trash2,
        disabled: !puedeBorrar,
        variant: "danger" as const,
        onClick: () =>
          setConfirmAction({
            title: "Eliminar usuario",
            message: `¿Eliminar a ${row.nombres}? Solo se permite si nunca tuvo movimientos.`,
            confirmLabel: "Eliminar",
            variant: "danger",
            onConfirm: () => ejecutar(row.legajo, "eliminar"),
          }),
      });
    }

    return items;
  };

  return { getActions, confirmAction, cerrarConfirm: () => setConfirmAction(null) };
}
