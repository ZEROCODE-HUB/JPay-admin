import { formatNumber } from "@/shared/format";
import { DataTable, type Column } from "@/shared/ui/data-table";
import type { AnalisisResumen } from "@/lib/conciliacion/engine";

export function KpiConciliacion({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-2.5 py-2.5 text-center ${
        accent ? "bg-primary/[0.06] border-primary/20" : "bg-muted/30 border-border/50"
      }`}
    >
      <div className="font-display text-[18px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
        {value}
      </div>
      <div className="text-[10.5px] font-medium uppercase tracking-widest text-muted-foreground mt-1.5 leading-none">
        {label}
      </div>
    </div>
  );
}

type RowNE = {
  id: string;
  tipo: string;
  importe: number;
  fecha: string;
  cvu: string;
};

const colsNoEncontrados: Column<RowNE>[] = [
  {
    key: "id",
    label: "ID_DEBIN",
    filterable: true,
    render: (r) => <span className="font-mono text-[11px]">{r.id}</span>,
  },
  {
    key: "tipo",
    label: "Tipo",
    filterable: "enum",
    filterOptions: ["CREDITO", "DEBITO"],
    render: (r) => r.tipo,
  },
  {
    key: "importe",
    label: "Importe",
    sortable: true,
    render: (r) => <span className="font-mono tabular-nums">{formatNumber(r.importe, 2)}</span>,
  },
  {
    key: "fecha",
    label: "Fecha",
    sortable: true,
    render: (r) => <span className="font-mono text-xs">{r.fecha}</span>,
  },
  {
    key: "cvu",
    label: "CVU",
    filterable: true,
    render: (r) => <span className="font-mono text-[11px]">{r.cvu || "—"}</span>,
  },
];

/** Tabla paginada de filas del banco sin match en plataforma. */
export function NoEncontradosTable({ items }: { items: AnalisisResumen["items"] }) {
  const noEncontrados = items.filter((it) => it.estado === "no_encontrado");
  if (noEncontrados.length === 0)
    return (
      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        Sin IDs — todo conciliado
      </span>
    );
  const rows: RowNE[] = noEncontrados.map((it) => ({
    id: it.bankRow.idDebin,
    tipo: it.bankRow.tipoMovCoelsa,
    importe: it.bankRow.importeCoelsa,
    fecha: it.bankRow.fechaHoraCoelsa || it.bankRow.fechaNegocio,
    cvu: it.bankRow.cvu,
  }));
  return (
    <DataTable columns={colsNoEncontrados} data={rows} keyExtractor={(r) => r.id} pageSize={10} />
  );
}

function IdsChips({
  ids,
  chipClassName,
  masLabel,
}: {
  ids: string[];
  chipClassName: string;
  masLabel: string;
}) {
  if (ids.length === 0)
    return (
      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        Sin IDs
      </span>
    );
  return (
    <div className="flex flex-wrap gap-1">
      {ids.slice(0, 20).map((id) => (
        <span key={id} className={chipClassName}>
          {id}
        </span>
      ))}
      {ids.length > 20 && (
        <span className="text-xs text-muted-foreground">
          +{ids.length - 20} {masLabel}
        </span>
      )}
    </div>
  );
}

/** Primeros 20 IDs no encontrados por tipo (depósitos / retiros). */
export function IdsResumidos({ resumen }: { resumen: AnalisisResumen }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <div className="text-[11px] font-semibold text-muted-foreground mb-1.5">
          Depósitos (CREDITO)
        </div>
        <IdsChips
          ids={resumen.idsDepositosNoEncontrados}
          chipClassName="inline-flex rounded-md border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[11px]"
          masLabel="más (ver tabla)"
        />
      </div>
      <div>
        <div className="text-[11px] font-semibold text-muted-foreground mb-1.5">
          Retiros (DEBITO)
        </div>
        <IdsChips
          ids={resumen.idsRetirosNoEncontrados}
          chipClassName="inline-flex rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[11px] text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
          masLabel="más"
        />
      </div>
    </div>
  );
}
