import { AlertTriangle, Inbox, Search } from "lucide-react";
import { formatDate, formatMoney } from "@/shared/format";
import { DataTable } from "@/shared/ui/data-table";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import { Pagination } from "@/shared/ui/pagination";
import { Input } from "@/components/portal-shell";
import type { LoteVenta } from "@/lib/api/types";
import { useOperacionesLoteVenta } from "../hooks/useOperacionesLoteVenta";
import { PAGE_SIZES, legajoComercioVenta, nombreComercioVenta } from "../utils";
import { columnasOperacionesLote } from "./columns";

/** Totales del lote + operaciones que lo componen. */
export function DetalleLoteVentaModal({ lote, onClose }: { lote: LoteVenta; onClose: () => void }) {
  const o = useOperacionesLoteVenta(lote);

  return (
    <ModalDialog
      open
      onClose={onClose}
      title="Detalle del lote de venta"
      description={`${formatDate(lote.fecha)} · ${nombreComercioVenta(lote)} · ${legajoComercioVenta(lote)} · ${lote.bandera}`}
      size="xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Operaciones</div>
            <div className="font-mono font-semibold text-lg">{lote.cantidadOperaciones}</div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Bruto</div>
            <div className="font-mono font-semibold text-lg">{formatMoney(lote.importeBruto)}</div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Impuestos Est.</div>
            <div className="font-mono font-semibold text-lg text-danger-600">
              - {formatMoney(lote.impuestos)}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Comisión Est.</div>
            <div className="font-mono font-semibold text-lg text-danger-600">
              - {formatMoney(lote.comision)}
            </div>
          </div>
          <div className="rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 p-3">
            <div className="text-xs text-muted-foreground">Neto Estimado</div>
            <div className="font-mono font-semibold text-lg text-emerald-700">
              {formatMoney(lote.netoEstimado)}
            </div>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={o.search}
            onChange={(e) => o.setSearch(e.target.value)}
            placeholder="Buscar por ID, legajo, cliente…"
            className="pl-8 h-8 text-xs"
          />
        </div>

        {o.isLoading ? (
          <div className="flex items-center justify-center rounded-xl border bg-card py-12 text-sm text-muted-foreground">
            <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
            Cargando operaciones…
          </div>
        ) : o.isError ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-danger-200 bg-danger-50 px-6 py-10 text-center text-sm text-danger-700">
            <AlertTriangle size={24} />
            <p>No se pudieron cargar las operaciones del lote.</p>
            <button
              onClick={() => o.refetch()}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground"
            >
              Reintentar
            </button>
          </div>
        ) : o.ops.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
            <Inbox size={24} />
            <p>No hay operaciones que coincidan.</p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columnasOperacionesLote}
              data={o.ops}
              keyExtractor={(r) => r.id}
              hidePagination
              showGlobalFilter={false}
              showDownloadButton={false}
            />
            <Pagination
              page={o.page + 1}
              totalPages={o.totalPages}
              pageSize={o.pageSize}
              total={o.total}
              countLabel="operaciones"
              pageSizes={PAGE_SIZES}
              onPageChange={(p) => o.setPage(p - 1)}
              onPageSizeChange={o.cambiarPageSize}
            />
          </>
        )}
      </div>
    </ModalDialog>
  );
}
