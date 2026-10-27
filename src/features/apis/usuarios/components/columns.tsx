import { Eye, FileCheck, PauseCircle, Power, Trash2 } from "lucide-react";
import { formatDateTime } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import type { ActionItem } from "@/components/actions-dropdown";
import { Badge } from "@/components/portal-shell";
import type { ApiUsuario, EstadoApiUsuario } from "@/lib/api/types";
import { estadoUsuarioApiTone } from "../estados";

export const usuariosColumns: Column<ApiUsuario>[] = [
  {
    key: "codigoUsuarioApi",
    label: "Código de usuario API",
    sortable: true,
    render: (r) => <span className="font-mono tabular-nums text-xs">#{r.codigoUsuarioApi}</span>,
  },
  {
    key: "usuario",
    label: "Usuario",
    sortable: true,
    render: (r) => <span className="font-medium">{r.usuario}</span>,
  },
  {
    key: "nombreCompleto",
    label: "Nombre completo",
    sortable: true,
    render: (r) => r.nombreCompleto,
  },
  {
    key: "estado",
    label: "Estado de la integración",
    sortable: true,
    render: (r) => <Badge tone={estadoUsuarioApiTone(r.estado)}>{r.estado}</Badge>,
  },
  {
    key: "createdAt",
    label: "Fecha de creación",
    sortable: true,
    render: (r) => <span className="font-mono tabular-nums">{formatDateTime(r.createdAt)}</span>,
  },
];

/** Acciones del menú de cada fila. */
export function usuarioAcciones(
  row: ApiUsuario,
  opts: {
    puedeModificar: boolean;
    puedeBorrar: boolean;
    onDetalle: (row: ApiUsuario) => void;
    onCambiarEstado: (row: ApiUsuario, nuevo: EstadoApiUsuario) => void;
    onEliminar: (row: ApiUsuario) => void;
  },
): ActionItem[] {
  return [
    { label: "Ver detalles", icon: Eye, onClick: () => opts.onDetalle(row) },
    {
      label: "Validar",
      icon: FileCheck,
      disabled: !opts.puedeModificar,
      onClick: () => opts.onCambiarEstado(row, "Homologación"),
    },
    {
      label: "Suspender",
      icon: PauseCircle,
      variant: "danger",
      disabled: !opts.puedeModificar,
      onClick: () => opts.onCambiarEstado(row, "Suspendido"),
    },
    {
      label: "Activar",
      icon: Power,
      disabled: !opts.puedeModificar,
      onClick: () => opts.onCambiarEstado(row, "Producción"),
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
