import { Edit3, Power, PowerOff, Trash2 } from "lucide-react";
import type { Column } from "@/shared/ui/data-table";
import type { ActionItem } from "@/components/actions-dropdown";
import { Badge } from "@/components/portal-shell";
import type { ApiEndpoint, EstadoEndpoint } from "@/lib/api/types";
import { estadoEndpointTone, metodoTone } from "../estados";

export const endpointsColumns: Column<ApiEndpoint>[] = [
  {
    key: "nombre",
    label: "Nombre del endpoint",
    sortable: true,
    render: (r) => <span className="font-semibold">{r.nombre}</span>,
  },
  {
    key: "path",
    label: "Path",
    sortable: true,
    render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.path}</span>,
  },
  {
    key: "metodo",
    label: "Tipo de endpoint",
    sortable: true,
    render: (r) => <Badge tone={metodoTone(r.metodo)}>{r.metodo}</Badge>,
  },
  {
    key: "descripcion",
    label: "Descripción",
    sortable: true,
    render: (r) => r.descripcion ?? <span className="text-muted-foreground">—</span>,
  },
  {
    key: "grupo",
    label: "Grupo de endpoints",
    sortable: true,
    render: (r) => r.grupo,
  },
  {
    key: "estado",
    label: "Estado",
    sortable: true,
    render: (r) => <Badge tone={estadoEndpointTone(r.estado)}>{r.estado}</Badge>,
  },
  {
    key: "rec",
    label: "REC",
    sortable: true,
    render: (r) => (r.rec ? <Badge tone="success">Sí</Badge> : <Badge tone="neutral">No</Badge>),
  },
];

/** Acciones del menú de cada fila. */
export function endpointAcciones(
  row: ApiEndpoint,
  opts: {
    puedeModificar: boolean;
    puedeBorrar: boolean;
    onEditar: (row: ApiEndpoint) => void;
    onCambiarEstado: (row: ApiEndpoint, nuevo: EstadoEndpoint) => void;
    onEliminar: (row: ApiEndpoint) => void;
  },
): ActionItem[] {
  return [
    {
      label: "Editar",
      icon: Edit3,
      disabled: !opts.puedeModificar,
      onClick: () => opts.onEditar(row),
    },
    row.estado === "Habilitado"
      ? {
          label: "Deshabilitar",
          icon: PowerOff,
          variant: "danger",
          disabled: !opts.puedeModificar,
          onClick: () => opts.onCambiarEstado(row, "Deshabilitado"),
        }
      : {
          label: "Habilitar",
          icon: Power,
          disabled: !opts.puedeModificar,
          onClick: () => opts.onCambiarEstado(row, "Habilitado"),
        },
    {
      label: "Eliminar",
      icon: Trash2,
      variant: "danger",
      disabled: !opts.puedeBorrar,
      onClick: () => opts.onEliminar(row),
    },
  ];
}
