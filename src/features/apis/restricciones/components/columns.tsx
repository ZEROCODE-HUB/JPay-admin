import { Edit3, Trash2 } from "lucide-react";
import { formatDate, formatDateTime } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import type { ActionItem } from "@/components/actions-dropdown";
import { Badge } from "@/components/portal-shell";
import type { ApiRestriccion, EstadoRestriccion } from "@/lib/api/types";
import { estadoOpuesto, estadoRestriccionTone } from "../estados";

export const restriccionColumns: Column<ApiRestriccion>[] = [
  {
    key: "apiUsuario.codigoUsuarioApi",
    label: "Código usuario API",
    sortable: true,
    render: (r) => (
      <span className="font-mono tabular-nums text-xs">
        {r.apiUsuario?.codigoUsuarioApi ? (
          `#${r.apiUsuario.codigoUsuarioApi}`
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </span>
    ),
  },
  {
    key: "apiUsuario.usuario",
    label: "Usuario",
    sortable: true,
    render: (r) => r.apiUsuario?.usuario ?? <span className="text-muted-foreground">—</span>,
  },
  {
    key: "apiUsuario.nombreCompleto",
    label: "Nombre completo",
    sortable: true,
    render: (r) => r.apiUsuario?.nombreCompleto ?? <span className="text-muted-foreground">—</span>,
  },
  {
    key: "estado",
    label: "Estado",
    sortable: true,
    render: (r) => <Badge tone={estadoRestriccionTone(r.estado)}>{r.estado}</Badge>,
  },
  {
    key: "fechaCreacion",
    label: "Fecha de creación",
    sortable: true,
    render: (r) => (
      <span className="font-mono tabular-nums">{formatDateTime(r.fechaCreacion)}</span>
    ),
  },
  {
    key: "fechaExpiracion",
    label: "Fecha de expiración",
    sortable: true,
    render: (r) => (
      <span className="font-mono tabular-nums">
        {r.fechaExpiracion ? (
          formatDate(r.fechaExpiracion)
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </span>
    ),
  },
];

/** Acciones del menú de cada restricción. */
export function restriccionAcciones(
  row: ApiRestriccion,
  opts: {
    puedeModificar: boolean;
    puedeBorrar: boolean;
    onEditar: (row: ApiRestriccion) => void;
    onCambiarEstado: (row: ApiRestriccion, nuevo: EstadoRestriccion) => void;
    onEliminar: (row: ApiRestriccion) => void;
  },
): ActionItem[] {
  return [
    {
      label: "Editar",
      icon: Edit3,
      disabled: !opts.puedeModificar,
      onClick: () => opts.onEditar(row),
    },
    {
      label: row.estado === "Restringiendo" ? "Sacar restricción" : "Restringir",
      icon: Edit3,
      variant: row.estado === "Restringiendo" ? "danger" : "default",
      disabled: !opts.puedeModificar,
      onClick: () => opts.onCambiarEstado(row, estadoOpuesto(row.estado)),
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
