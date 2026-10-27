import { CheckCircle, Edit3, Trash2, XCircle } from "lucide-react";
import type { Column } from "@/shared/ui/data-table";
import type { ActionItem } from "@/components/actions-dropdown";
import { Badge } from "@/components/portal-shell";
import type { CodigoCategoria } from "@/lib/api/types";
import { estadoCategoriaTone } from "../estados";
import type { EstadoCategoria } from "../utils";

export const categoriaColumns: Column<CodigoCategoria>[] = [
  {
    key: "codigo",
    label: "Código",
    sortable: true,
    render: (r) => <span className="font-mono text-xs">{r.codigo}</span>,
  },
  {
    key: "nombre",
    label: "Nombre",
    sortable: true,
    render: (r) => <span className="font-semibold">{r.nombre}</span>,
  },
  {
    key: "descripcion",
    label: "Descripción",
    sortable: true,
    render: (r) => <span className="text-sm text-muted-foreground">{r.descripcion}</span>,
  },
  {
    key: "estado",
    label: "Estado",
    sortable: true,
    render: (r) => <Badge tone={estadoCategoriaTone(r.estado)}>{r.estado}</Badge>,
  },
];

/** Acciones del menú de cada categoría. */
export function categoriaAcciones(
  row: CodigoCategoria,
  opts: {
    puedeModificar: boolean;
    puedeBorrar: boolean;
    onCambiarEstado: (row: CodigoCategoria, nuevo: EstadoCategoria) => void;
    onEditar: (row: CodigoCategoria) => void;
    onEliminar: (row: CodigoCategoria) => void;
  },
): ActionItem[] {
  const items: ActionItem[] = [];
  if (row.estado === "activo") {
    items.push({
      label: "Desactivar",
      icon: XCircle,
      variant: "danger",
      disabled: !opts.puedeModificar,
      onClick: () => opts.onCambiarEstado(row, "inactivo"),
    });
  } else {
    items.push({
      label: "Activar",
      icon: CheckCircle,
      disabled: !opts.puedeModificar,
      onClick: () => opts.onCambiarEstado(row, "activo"),
    });
  }
  items.push({
    label: "Editar",
    icon: Edit3,
    disabled: !opts.puedeModificar,
    onClick: () => opts.onEditar(row),
  });
  items.push({
    label: "Eliminar",
    icon: Trash2,
    variant: "danger",
    disabled: !opts.puedeBorrar,
    onClick: () => opts.onEliminar(row),
  });
  return items;
}
