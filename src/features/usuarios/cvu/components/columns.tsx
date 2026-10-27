import { formatCuit } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import { Badge } from "@/components/portal-shell";
import { LegajoCell, LEGAJO_TOOLTIP } from "@/components/legajo-label";
import type { SubcuentaTipo } from "@/lib/api/subcuentas";
import { estadoCvu, TIPO_SUBCUENTA_META, tipoSubcuentaClases } from "../estados";
import type { CvuTableRow } from "../utils";

function EstadoBadge({ estado }: { estado: string }) {
  const m = estadoCvu(estado);
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

function TipoSubcuentaBadge({ tipo }: { tipo: SubcuentaTipo }) {
  const meta = TIPO_SUBCUENTA_META[tipo] ?? {
    label: tipo,
    icon: TIPO_SUBCUENTA_META.Operativa.icon,
  };
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${tipoSubcuentaClases(tipo)}`}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

export const columns: Column<CvuTableRow>[] = [
  {
    key: "_legajo",
    label: "Legajo",
    hint: LEGAJO_TOOLTIP,
    filterable: true,
    render: (r) => (
      <div className="flex flex-col">
        <LegajoCell legajo={r._legajo} />
        <span className="text-[11px] text-muted-foreground font-mono">{formatCuit(r._cuit)}</span>
      </div>
    ),
  },
  { key: "_correo", label: "Usuario", filterable: true, render: (r) => r._correo },
  { key: "_nombre", label: "Nombre", filterable: true, render: (r) => r._nombre },
  { key: "_apellido", label: "Apellido", filterable: true, render: (r) => r._apellido },
  {
    key: "_tipo",
    label: "Tipo",
    minWidth: 140,
    filterable: true,
    render: (r) => <TipoSubcuentaBadge tipo={r._tipo} />,
  },
  {
    key: "_cvu",
    label: "CVU",
    filterable: true,
    render: (r) =>
      r._cvu && r._cvu !== "—" ? (
        <span className="font-mono tabular-nums">{r._cvu}</span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-300 bg-amber-50 text-amber-800 text-[11px] font-medium">
          Pendiente de asignación
        </span>
      ),
  },
  {
    key: "_cbk",
    label: "CBK",
    render: (r) => <span className="font-mono tabular-nums">{r._cbk}</span>,
  },
  { key: "_alias", label: "Alias", render: (r) => r._alias },
  { key: "_estado", label: "Estado", render: (row) => <EstadoBadge estado={row._estado} /> },
  {
    key: "_fechaAlta",
    label: "Fecha de alta",
    render: (r) => <span className="font-mono tabular-nums text-xs">{r._fechaAlta}</span>,
  },
];
