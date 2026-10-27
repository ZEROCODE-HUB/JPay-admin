import { Edit3, Eye, Power, PowerOff, Trash2 } from "lucide-react";
import type { Column } from "@/shared/ui/data-table";
import type { ActionItem } from "@/components/actions-dropdown";
import { Badge } from "@/components/portal-shell";
import type { Impuesto } from "@/lib/api/types";
import { estadoActivoTone, formatMontoImpuesto } from "../../utils";
import type { CatalogoState } from "../hooks/useImpuestosCatalogo";

export const columnasImpuestos: Column<Impuesto>[] = [
  {
    key: "codigo",
    label: "Código",
    sortable: true,
    render: (r) => <span className="font-mono text-xs font-semibold">{r.codigo}</span>,
  },
  {
    key: "nombre",
    label: "Nombre",
    sortable: true,
    render: (r) => <span className="font-medium">{r.nombre}</span>,
  },
  {
    key: "descripcion",
    label: "Descripción",
    render: (r) => r.descripcion ?? "—",
  },
  {
    key: "tipo",
    label: "Tipo",
    sortable: true,
    render: (r) => r.tipo,
  },
  {
    key: "monto",
    label: "Monto",
    sortable: true,
    render: (r) =>
      r.monto === null ? (
        "—"
      ) : (
        <span className="font-mono tabular-nums">{formatMontoImpuesto(r.tipo, r.monto)}</span>
      ),
  },
  {
    key: "estado",
    label: "Estado",
    sortable: true,
    render: (r) => <Badge tone={estadoActivoTone(r.estado)}>{r.estado}</Badge>,
  },
];

/** Menú de acciones de una fila del catálogo. */
export function accionesImpuesto(s: CatalogoState, row: Impuesto): ActionItem[] {
  return [
    { label: "Ver detalles", icon: Eye, onClick: () => s.setDetail(row) },
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
