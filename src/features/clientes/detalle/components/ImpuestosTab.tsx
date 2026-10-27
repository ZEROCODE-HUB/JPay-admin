import type { ClienteDetalleData } from "../hooks/useClienteDetalle";
import type { ClienteDetalleUi } from "../hooks/useClienteDetalleUi";
import { Seccion } from "./Seccion";
import { TablaImpuestos } from "./TablaImpuestos";

export function ImpuestosTab({ data, ui }: { data: ClienteDetalleData; ui: ClienteDetalleUi }) {
  const { impuestosQuery } = data;
  const { setImpuestoDetail } = ui;

  return (
    <>
      <Seccion
        titulo="Impuestos asignados"
        loading={impuestosQuery.isLoading}
        error={impuestosQuery.isError ? impuestosQuery.error : null}
        onRetry={impuestosQuery.refetch}
        vacio={impuestosQuery.rows.length === 0}
      >
        <TablaImpuestos rows={impuestosQuery.rows} onVerDetalles={(a) => setImpuestoDetail(a)} />
      </Seccion>
      {/* Pendientes de conectar a la base: sin datos de ejemplo. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Impuestos pendientes de pago
          </h4>
          <p className="text-xs text-muted-foreground">Sin pendientes.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Impuestos pagados
          </h4>
          <p className="text-xs text-muted-foreground">Sin pagados.</p>
        </div>
      </div>
    </>
  );
}
