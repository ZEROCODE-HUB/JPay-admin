import { formatMoney } from "@/shared/format";
import { Wallet } from "lucide-react";
import { Card } from "@/components/portal-shell";
import { Input, Label } from "@/components/portal-shell";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { useComisionesDashboard } from "../hooks/useComisionesDashboard";
import type { ComisionPorComercio } from "../utils";

const desgloseColumns: Column<ComisionPorComercio>[] = [
  {
    key: "legajo",
    label: "Legajo",
    render: (r) => <span className="font-mono text-xs">{r.legajo}</span>,
  },
  {
    key: "nombre",
    label: "Cliente",
    render: (r) => <span className="text-sm truncate max-w-[180px] inline-block">{r.nombre}</span>,
  },
  {
    key: "count",
    label: "Ops",
    render: (r) => <span className="font-mono text-xs">{r.count}</span>,
  },
  {
    key: "monto",
    label: "Monto transaccionado",
    render: (r) => <span className="font-mono text-xs">{formatMoney(r.monto)}</span>,
  },
  {
    key: "comision",
    label: "Comisión",
    render: (r) => <span className="font-mono text-xs">{formatMoney(r.comision)}</span>,
  },
  {
    key: "remanente",
    label: "Remanente",
    render: (r) => (
      <span className="font-mono text-xs font-semibold">{formatMoney(r.monto - r.comision)}</span>
    ),
  },
];

/** Comisiones de depósitos y retiros en un rango de fechas, con desglose por comercio. */
export function ComisionesCard() {
  const {
    desde,
    setDesde,
    hasta,
    setHasta,
    showDesglose,
    setShowDesglose,
    isLoading,
    montoTransaccionado,
    comisionTotal,
    remanente,
    porComercio,
  } = useComisionesDashboard();

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <Wallet size={14} /> Comisiones — Depósitos y Retiros
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="com-desde">Desde</Label>
            <Input
              id="com-desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="h-8 text-xs w-[150px]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Label htmlFor="com-hasta">Hasta</Label>
            <Input
              id="com-hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="h-8 text-xs w-[150px]"
            />
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
          Cargando comisiones…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border bg-muted/30 px-3 py-3">
              <div className="text-xs text-muted-foreground">Monto transaccionado</div>
              <div className="font-mono font-semibold mt-1">{formatMoney(montoTransaccionado)}</div>
              <div className="text-[11px] text-muted-foreground">Depósitos + Retiros</div>
            </div>
            <div className="rounded-lg border bg-muted/30 px-3 py-3">
              <div className="text-xs text-muted-foreground">Comisión total</div>
              <div className="font-mono font-semibold mt-1 text-primary-ink">
                {formatMoney(comisionTotal)}
              </div>
              <div className="text-[11px] text-muted-foreground">Suma comision</div>
            </div>
            <div className="rounded-lg border bg-primary/10 px-3 py-3">
              <div className="text-xs text-muted-foreground">Remanente</div>
              <div className="font-mono font-semibold mt-1 text-emerald-700">
                {formatMoney(remanente)}
              </div>
              <div className="text-[11px] text-muted-foreground">Monto − Comisión</div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Este cuadro refleja el flujo de transacciones del periodo seleccionado, no el saldo
            acumulado de la cuenta recaudadora.
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowDesglose((v) => !v)}
              className="text-xs font-semibold text-primary-ink hover:underline"
            >
              {showDesglose
                ? "Ocultar desglose por comercio"
                : `Ver desglose por comercio (${porComercio.length})`}
            </button>
            {showDesglose && (
              <div className="mt-3">
                {porComercio.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin movimientos en el periodo.</p>
                ) : (
                  <DataTable
                    columns={desgloseColumns}
                    data={porComercio}
                    keyExtractor={(r) => r.legajo}
                    showGlobalFilter={false}
                    showDownloadButton={false}
                  />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
