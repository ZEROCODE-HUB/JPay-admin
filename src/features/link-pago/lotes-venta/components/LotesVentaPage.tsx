import { AlertTriangle, Eye, Inbox } from "lucide-react";
import { DataTable } from "@/shared/ui/data-table";
import { Pagination } from "@/shared/ui/pagination";
import { PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { useLotesVenta } from "../hooks/useLotesVenta";
import { PAGE_SIZES, keyLoteVenta } from "../utils";
import { columnasLotesVenta } from "./columns";
import { DetalleLoteVentaModal } from "./DetalleLoteVentaModal";
import { LotesVentaFiltros } from "./LotesVentaFiltros";

/** Venta bruta acumulada del día por comercio, bandera y fecha (v_lotes_venta). */
export function LotesVentaPage() {
  const s = useLotesVenta();

  return (
    <PermissionGuard recurso="comercios">
      <PageHeader
        title="Lotes de Venta"
        description="Venta bruta acumulada del día por comercio, bandera y fecha (desde v_lotes_venta). Información de proyección, la liquidación real vive en Lotes de Acreditación."
      />

      <LotesVentaFiltros s={s} />

      {s.isLoading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 text-sm text-muted-foreground">
          <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
          Cargando lotes de venta…
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
      ) : s.lotes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          <Inbox size={28} />
          <p>No hay lotes de venta que coincidan con los filtros.</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columnasLotesVenta}
            data={s.lotes}
            keyExtractor={keyLoteVenta}
            hidePagination
            showGlobalFilter={false}
            showDownloadButton={false}
            actions={(r) => (
              <button
                type="button"
                onClick={() => s.setDetalle(r)}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-input bg-card text-xs font-semibold hover:bg-accent transition"
              >
                <Eye size={14} />
                Ver detalle
              </button>
            )}
          />
          <Pagination
            page={s.page + 1}
            totalPages={s.totalPages}
            pageSize={s.pageSize}
            total={s.total}
            countLabel="registros"
            pageSizes={PAGE_SIZES}
            disabled={s.isFetching}
            onPageChange={(p) => s.setPage(p - 1)}
            onPageSizeChange={s.cambiarPageSize}
          />
        </>
      )}

      {s.detalle && <DetalleLoteVentaModal lote={s.detalle} onClose={() => s.setDetalle(null)} />}
    </PermissionGuard>
  );
}
