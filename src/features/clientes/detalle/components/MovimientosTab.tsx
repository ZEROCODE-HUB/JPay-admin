import { formatMoney } from "@/shared/format";
import { resolverEstadoMovimiento } from "@/lib/estados";
import type { ClienteDetalleData } from "../hooks/useClienteDetalle";
import type { ClienteDetalleUi } from "../hooks/useClienteDetalleUi";
import { toDetalleMovimiento } from "../utils";
import { Seccion } from "./Seccion";
import { TablaMovimientos } from "./TablaMovimientos";

export function MovimientosTab({ data, ui }: { data: ClienteDetalleData; ui: ClienteDetalleUi }) {
  const { subcuentasQuery, catalogoEstados } = data;
  const {
    movDesde,
    setMovDesde,
    movHasta,
    setMovHasta,
    movPage,
    setMovPage,
    movimientosQuery,
    movimientosStatsQuery,
  } = data.movimientos;
  const { setMovDetail, setEstadoTarget } = ui;

  const statsRows = movimientosStatsQuery.data?.rows ?? movimientosQuery.rows;
  // Saldo real = suma de subcuentas (disponible + retenido) como en el portal de clientes (Enterprises) app.index.tsx:98-99
  // Cuenta general = +1 (principal) no aporta saldo extra, saldo = disp+retenido de todas las subcuentas del legajo
  const saldoTotal = (subcuentasQuery.data ?? []).reduce(
    (acc, s) => acc + Number(s.saldoDisponible ?? 0) + Number(s.saldoRetenido ?? 0),
    0,
  );
  const totalMovimientos = movimientosStatsQuery.data?.total ?? movimientosQuery.total ?? 0;
  const porTipo = statsRows.reduce<Record<string, number>>((acc, r) => {
    const k = r.tipo ?? "otro";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mt-6 space-y-4">
      {/* Filtros por período */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Fecha desde
            </label>
            <input
              type="date"
              value={movDesde}
              onChange={(e) => setMovDesde(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Fecha hasta
            </label>
            <input
              type="date"
              value={movHasta}
              onChange={(e) => setMovHasta(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setMovDesde("");
              setMovHasta("");
            }}
            className="h-9 rounded-md border border-input px-3 text-sm font-medium hover:bg-accent"
          >
            Limpiar
          </button>
          <span className="text-xs text-muted-foreground">
            {movimientosStatsQuery.isFetching
              ? "Actualizando…"
              : `${totalMovimientos} movimiento(s) en el período`}
          </span>
        </div>
      </div>

      {/* KPIs generales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Saldo total de la cuenta
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{formatMoney(saldoTotal)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Disponible + retenido ·{" "}
            {(subcuentasQuery.data?.length ?? 0) > 0
              ? `1 principal + ${subcuentasQuery.data!.length} subcuenta(s)`
              : "sin subcuentas"}
            {subcuentasQuery.isLoading ? " (cargando…)" : ""}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total de movimientos
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{totalMovimientos}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {Object.keys(porTipo).length} tipo(s) distinto(s)
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Movimientos por tipo
          </p>
          {Object.keys(porTipo).length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Sin datos en el período.</p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {Object.entries(porTipo)
                .sort((a, b) => b[1] - a[1])
                .map(([tipo, cant]) => (
                  <li key={tipo} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">{tipo}</span>
                    <span className="font-mono font-semibold tabular-nums rounded-full bg-muted px-2 py-0.5 text-xs">
                      {cant}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      {/* Tabla paginada */}
      <Seccion
        titulo={`Movimientos${movDesde || movHasta ? " del período" : " recientes"} — página ${movPage + 1}`}
        loading={movimientosQuery.isLoading}
        error={movimientosQuery.isError ? movimientosQuery.error : null}
        onRetry={movimientosQuery.refetch}
        vacio={movimientosQuery.rows.length === 0}
      >
        <TablaMovimientos
          rows={movimientosQuery.rows}
          onVerDetalles={(m) => setMovDetail(toDetalleMovimiento(m, catalogoEstados))}
          onCambiarEstado={(m) =>
            setEstadoTarget({
              dbId: m.id,
              estadoActual: resolverEstadoMovimiento(m, catalogoEstados).codigo,
              nuevoId: m.estadoId ?? 0,
            })
          }
        />
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {totalMovimientos} total · página {movPage + 1} de{" "}
            {Math.max(1, Math.ceil(totalMovimientos / 10))}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={movPage === 0}
              onClick={() => setMovPage((p) => Math.max(0, p - 1))}
              className="h-8 rounded-md border border-input px-3 text-xs font-medium disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={(movPage + 1) * 10 >= totalMovimientos}
              onClick={() => setMovPage((p) => p + 1)}
              className="h-8 rounded-md border border-input px-3 text-xs font-medium disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </Seccion>
    </div>
  );
}
