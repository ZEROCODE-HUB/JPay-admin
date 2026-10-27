import { AlertTriangle, Building2, Eye, X } from "lucide-react";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { PermissionGuard } from "@/components/permission-guard";
import { Card, Label, PageHeader } from "@/components/portal-shell";
import type { EstadoAdelanto } from "@/lib/api/types";
import { DataTable } from "@/shared/ui/data-table";
import { Pagination } from "@/shared/ui/pagination";
import { ESTADOS } from "../estados";
import { useAdelantos } from "../hooks/useAdelantos";
import { AdelantoDetalleModal } from "./AdelantoDetalleModal";
import { PoolKpis, TotalesEstadoKpis } from "./AdelantosKpis";
import { adelantosColumns } from "./columns";

/** Pantalla "Adelantos de Dinero" de links de pago. */
export function AdelantosPage() {
  const s = useAdelantos();

  return (
    <PermissionGuard recurso="comercios">
      <PageHeader
        title="Adelantos de Dinero"
        description="Solicitudes de comercios para recibir fondos antes del plazo contractual. Se fondean desde la subcuenta Recaudación (pool) hacia la Operativa del comercio."
      />

      {/* Banner contextual: la URL trae `comercio` y el listado está filtrado. */}
      {!!s.comercioFromUrl && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 mb-4 flex items-center gap-2">
          <Building2 size={14} />
          <span>
            Viniendo del calendario: listado filtrado al comercio{" "}
            <span className="font-mono">{s.comercioFromUrl}</span>.
          </span>
          <button
            type="button"
            onClick={s.limpiarFiltroComercio}
            className="ml-auto h-6 px-2 rounded-md border bg-card text-xs hover:bg-muted inline-flex items-center gap-1"
          >
            <X size={12} /> Quitar filtro
          </button>
        </div>
      )}

      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label>Estado</Label>
            <select
              value={s.estadoFilter}
              onChange={(e) => s.cambiarEstado(e.target.value as EstadoAdelanto | "")}
              className="w-full sm:min-w-[130px] h-8 px-2 rounded-md border bg-background text-xs"
            >
              <option value="">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <PoolKpis pool={s.poolCabecera} />

      <TotalesEstadoKpis totales={s.totales} />

      {s.isLoading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 text-sm text-muted-foreground">
          <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
          Cargando adelantos…
        </div>
      ) : s.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-danger-200 bg-danger-50 px-6 py-12 text-center text-sm text-danger-700">
          <AlertTriangle size={28} />
          <p>{s.error?.message ?? "Error"}</p>
          <button
            onClick={() => s.refetch()}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <DataTable
            columns={adelantosColumns}
            data={s.rowsVisibles}
            keyExtractor={(r) => r.fullId}
            actions={(r) => (
              <ActionsDropdown
                actions={[{ label: "Ver / gestionar", icon: Eye, onClick: () => s.setDetail(r) }]}
              />
            )}
            hidePagination
          />
          <Pagination
            page={s.page + 1}
            totalPages={s.totalPages}
            pageSize={s.pageSize}
            total={s.total}
            countLabel="adelantos"
            disabled={s.isFetching}
            onPageChange={(p) => s.setPage(p - 1)}
            onPageSizeChange={s.setPageSize}
          />
        </>
      )}

      {s.detail && (
        <AdelantoDetalleModal
          a={s.detail}
          onClose={s.cerrarDetalle}
          onSave={s.onSave}
          onAcreditado={s.onAcreditado}
        />
      )}
    </PermissionGuard>
  );
}
