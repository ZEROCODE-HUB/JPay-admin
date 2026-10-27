import { useNavigate } from "@tanstack/react-router";
import { Eye, XCircle, RotateCcw, ShieldCheck, Ban, Trash2, CheckCircle } from "lucide-react";
import type { ActionItem } from "@/components/actions-dropdown";
import { normalizarEstado } from "@/lib/cliente-estados";
import { useAccionesCliente } from "../../comun/hooks/useAccionesCliente";
import type { JuridicaRow } from "../utils";

/** Menú de acciones por fila + diálogo de confirmación de Personas jurídicas. */
export function useJuridicasAcciones() {
  const navigate = useNavigate();
  const { confirmAction, setConfirmAction, ejecutar, puedeModificar, puedeBorrar } =
    useAccionesCliente({
      exito: "Estado actualizado",
      errorToast: "No se pudo completar",
      errorMensaje: "Error",
    });

  const verDetalle = (row: JuridicaRow) =>
    navigate({ to: "/admin/general/usuarios/$legajo", params: { legajo: row.legajo } });

  const getActions = (row: JuridicaRow): ActionItem[] => {
    const norm = normalizarEstado(row.estadoRaw);
    const items: ActionItem[] = [
      { label: "Ver detalle", icon: Eye, onClick: () => verDetalle(row) },
    ];
    if (norm === "registrado")
      items.push({
        label: "Preactivar (aprobar documentación)",
        icon: ShieldCheck,
        disabled: !puedeModificar,
        onClick: () =>
          setConfirmAction({
            title: "Aprobar documentación",
            message: `¿Aprobar la documentación de ${row.razonSocial}?`,
            confirmLabel: "Aprobar",
            variant: "default",
            onConfirm: () => ejecutar(row.legajo, "aprobar"),
          }),
      });
    if (norm === "preactivado")
      items.push({
        label: "Activar",
        icon: CheckCircle,
        disabled: !puedeModificar,
        onClick: () =>
          setConfirmAction({
            title: "Activar persona jurídica",
            message: `¿Activar a ${row.razonSocial}? Requiere CVU y comisión.`,
            confirmLabel: "Activar",
            variant: "default",
            onConfirm: () => ejecutar(row.legajo, "activar"),
          }),
      });
    if (norm === "activado")
      items.push({
        label: "Suspender",
        icon: XCircle,
        disabled: !puedeModificar,
        variant: "danger" as const,
        onClick: () =>
          setConfirmAction({
            title: "Suspender persona jurídica",
            message: `¿Suspender a ${row.razonSocial}?`,
            confirmLabel: "Suspender",
            variant: "danger",
            onConfirm: () => ejecutar(row.legajo, "suspender"),
          }),
      });
    if (norm === "suspendido")
      items.push({
        label: "Reactivar",
        icon: RotateCcw,
        disabled: !puedeModificar,
        onClick: () =>
          setConfirmAction({
            title: "Reactivar persona jurídica",
            message: `¿Reactivar a ${row.razonSocial}?`,
            confirmLabel: "Reactivar",
            variant: "default",
            onConfirm: () => ejecutar(row.legajo, "reactivar"),
          }),
      });
    if (norm !== "deshabilitado" && norm !== "eliminado") {
      items.push({
        label: "Deshabilitar",
        icon: Ban,
        disabled: !puedeModificar,
        variant: "danger" as const,
        onClick: () =>
          setConfirmAction({
            title: "Deshabilitar",
            message: `¿Deshabilitar a ${row.razonSocial}? Se cancelará CVU y se conservará historial.`,
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
            title: "Eliminar",
            message: `¿Eliminar a ${row.razonSocial}? Solo si nunca tuvo movimientos.`,
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
