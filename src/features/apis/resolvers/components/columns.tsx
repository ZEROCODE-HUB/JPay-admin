import { CheckCircle, XCircle, Edit3 } from "lucide-react";
import { Badge } from "@/components/portal-shell";
import type { Column } from "@/shared/ui/data-table";
import type { ActionItem } from "@/components/actions-dropdown";
import type { Resolver, ResolverEstado } from "@/lib/api/types";
import { estadoResolverTone } from "../estados";

export const resolverColumns: Column<Resolver>[] = [
  {
    key: "nombre",
    label: "Nombre del resolver",
    sortable: true,
    render: (r) => <span className="font-semibold">{r.nombre}</span>,
  },
  {
    key: "cuit",
    label: "CUIT del resolver",
    sortable: true,
    render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.cuit}</span>,
  },
  {
    key: "url",
    label: "URL del resolver",
    sortable: true,
    render: (r) => <span className="text-xs font-mono text-foreground/80">{r.url || "—"}</span>,
  },
  {
    key: "pcpId",
    label: "PCP ID",
    sortable: true,
    render: (r) => <span className="font-mono text-xs">{r.pcpId || "—"}</span>,
  },
  {
    key: "estado",
    label: "Estado",
    sortable: true,
    render: (r) => <Badge tone={estadoResolverTone(r.estado)}>{r.estado}</Badge>,
  },
];

/** Acciones del menú de cada fila: activar/desactivar, editar y eliminar. */
export function resolverAcciones(
  row: Resolver,
  {
    puedeModificar,
    puedeBorrar,
    onCambiarEstado,
    onEditar,
    onEliminar,
  }: {
    puedeModificar: boolean;
    puedeBorrar: boolean;
    onCambiarEstado: (row: Resolver, nuevo: ResolverEstado) => void;
    onEditar: (row: Resolver) => void;
    onEliminar: (row: Resolver) => void;
  },
): ActionItem[] {
  const items: ActionItem[] = [];
  if (row.estado === "Activo") {
    items.push({
      label: "Desactivar",
      icon: XCircle,
      variant: "danger",
      disabled: !puedeModificar,
      onClick: () => onCambiarEstado(row, "Inactivo"),
    });
  } else {
    items.push({
      label: "Activar",
      icon: CheckCircle,
      disabled: !puedeModificar,
      onClick: () => onCambiarEstado(row, "Activo"),
    });
  }
  items.push({
    label: "Editar",
    icon: Edit3,
    disabled: !puedeModificar,
    onClick: () => onEditar(row),
  });
  items.push({
    label: "Eliminar",
    icon: XCircle,
    variant: "danger",
    disabled: !puedeBorrar,
    onClick: () => onEliminar(row),
  });
  return items;
}
