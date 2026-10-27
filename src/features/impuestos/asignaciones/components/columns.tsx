import { Edit3, Power, PowerOff, Trash2 } from "lucide-react";
import { formatDate } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import type { ActionItem } from "@/components/actions-dropdown";
import { Badge } from "@/components/portal-shell";
import type { ImpuestoAsignacion } from "@/lib/api/types";
import { estadoActivoTone, formatMontoImpuesto } from "../../utils";
import type { AsignacionesState } from "../hooks/useAsignacionesImpuestos";

export const columnasAsignaciones: Column<ImpuestoAsignacion>[] = [
  {
    key: "clienteLegajo",
    label: "Legajo",
    sortable: true,
    render: (r) => <span className="font-mono tabular-nums text-xs">{r.clienteLegajo}</span>,
  },
  {
    key: "clienteNombre",
    label: "Cliente",
    render: (r) =>
      r.cliente ? (
        <div className="leading-tight">
          <div className="font-medium">{r.cliente.nombre}</div>
          <div className="text-xs text-muted-foreground font-mono">{r.cliente.cuit}</div>
        </div>
      ) : (
        "—"
      ),
  },
  {
    key: "impuesto",
    label: "Impuesto aplicado",
    render: (r) =>
      r.impuesto ? (
        <div className="leading-tight">
          <div className="font-medium">{r.impuesto.nombre}</div>
          <div className="text-xs text-muted-foreground font-mono">{r.impuesto.codigo}</div>
        </div>
      ) : (
        "—"
      ),
  },
  {
    key: "tipo",
    label: "Tipo",
    sortable: true,
    render: (r) => r.tipo,
  },
  {
    key: "tipoOperacion",
    label: "Operación",
    sortable: true,
    render: (r) =>
      r.tipoOperacion ? (
        <Badge tone="neutral">{r.tipoOperacion}</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">Todas</span>
      ),
  },
  {
    key: "monto",
    label: "Monto",
    render: (r) => (
      <span className="font-mono tabular-nums">{formatMontoImpuesto(r.tipo, r.monto)}</span>
    ),
  },
  {
    key: "estado",
    label: "Estado",
    sortable: true,
    render: (r) => <Badge tone={estadoActivoTone(r.estado)}>{r.estado}</Badge>,
  },
  {
    key: "fechaAsignacion",
    label: "Fecha de asignación",
    sortable: true,
    render: (r) =>
      r.fechaAsignacion ? (
        <span className="font-mono tabular-nums">{formatDate(r.fechaAsignacion)}</span>
      ) : (
        "—"
      ),
  },
];

/** Menú de acciones de una asignación. */
export function accionesAsignacion(s: AsignacionesState, row: ImpuestoAsignacion): ActionItem[] {
  return [
    {
      label: row.estado === "Activo" ? "Desactivar" : "Activar",
      icon: row.estado === "Activo" ? PowerOff : Power,
      disabled: !s.puedeModificar,
      onClick: () => s.toggleEstado(row),
    },
    {
      label: "Editar",
      icon: Edit3,
      disabled: !s.puedeModificar,
      onClick: () => s.setEditTarget(row),
    },
    {
      label: "Eliminar",
      icon: Trash2,
      variant: "danger",
      disabled: !s.puedeBorrar,
      onClick: () => s.setConfirmDelete(row),
    },
  ];
}
