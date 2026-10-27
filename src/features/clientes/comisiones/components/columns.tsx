import { Edit3, Eye, XCircle } from "lucide-react";
import { formatMoney, formatPercent } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import type { ActionItem } from "@/components/actions-dropdown";
import { Badge } from "@/components/portal-shell";
import { LegajoCell, LEGAJO_TOOLTIP } from "@/components/legajo-label";
import type { CargaComisionesState } from "../hooks/useCargaComisiones";
import { TIPOS_COMISION_USUARIOS, type Comision } from "../utils";

export const columnasComisiones: Column<Comision>[] = [
  {
    key: "legajo",
    label: "Legajo",
    hint: LEGAJO_TOOLTIP,
    filterable: true,
    render: (r) => <LegajoCell legajo={r.legajo} />,
  },
  { key: "correo", label: "Usuario", filterable: true, render: (r) => r.correo },
  {
    key: "cvu",
    label: "Alcance / CVU",
    minWidth: 220,
    render: (r) =>
      r.subcuentaId ? (
        <div className="flex flex-col gap-0.5">
          <Badge tone="warn">CVU</Badge>
          <span className="font-mono tabular-nums text-xs">{r.cvu ?? "CVU sin número"}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          <Badge tone="neutral">Toda la cuenta</Badge>
          <span className="text-[11px] text-muted-foreground">Respaldo de todos sus CVU</span>
        </div>
      ),
  },
  {
    key: "cuit",
    label: "CUIT",
    render: (r) => <span className="font-mono tabular-nums">{r.cuit}</span>,
  },
  {
    key: "operacion",
    label: "Código de operación",
    filterable: true,
    render: (r) => <span className="font-mono tabular-nums">{r.operacion}</span>,
  },
  {
    key: "tipo",
    label: "Operación",
    filterable: "enum",
    filterOptions: [...TIPOS_COMISION_USUARIOS],
    render: (r) => r.tipo,
  },
  {
    key: "modalidad",
    label: "Modalidad",
    filterable: "enum",
    filterOptions: ["Fijo", "Porcentaje"],
    render: (r) => r.modalidad,
  },
  {
    key: "porcentaje",
    label: "% Comisión",
    render: (r) => (
      <span className="font-mono tabular-nums">
        {r.modalidad === "Porcentaje" ? formatPercent(r.porcentaje ?? 0) : "—"}
      </span>
    ),
  },
  {
    key: "montoFijo",
    label: "Monto fijo",
    render: (r) => (
      <span className="font-mono tabular-nums">
        {r.modalidad === "Fijo" ? formatMoney(r.montoFijo ?? 0) : "—"}
      </span>
    ),
  },
  {
    key: "porcentajeImpuesto",
    label: "% Impuesto (IVA)",
    render: (r) => (
      <span className="font-mono tabular-nums">{formatPercent(r.porcentajeImpuesto)}</span>
    ),
  },
  {
    key: "estado",
    label: "Estado",
    filterable: "enum",
    filterOptions: ["Habilitado", "Deshabilitado"],
    render: (row) => (
      <Badge tone={row.estado === "Habilitado" ? "success" : "danger"}>
        {row.estado === "Habilitado" ? "Habilitado" : "Deshabilitado"}
      </Badge>
    ),
  },
  { key: "descripcion", label: "Descripción", filterable: true, render: (r) => r.descripcion },
];

/** Menú de acciones de una comisión: ver, editar y habilitar / deshabilitar. */
export function accionesComision(s: CargaComisionesState, row: Comision): ActionItem[] {
  return [
    { label: "Ver detalles", icon: Eye, onClick: () => s.setViewing(row) },
    {
      label: "Editar",
      icon: Edit3,
      onClick: () => s.abrirEdicion(row),
      disabled: !s.puedeModificar,
    },
    row.estado === "Habilitado"
      ? {
          label: "Deshabilitar",
          icon: XCircle,
          variant: "danger",
          disabled: !s.puedeModificar,
          onClick: () => s.pedirCambioEstado(row),
        }
      : {
          label: "Habilitar",
          icon: Eye,
          disabled: !s.puedeModificar,
          onClick: () => s.pedirCambioEstado(row),
        },
  ];
}
