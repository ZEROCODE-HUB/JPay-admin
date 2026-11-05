import { AlertTriangle, Inbox } from "lucide-react";
import { DataTable } from "@/shared/ui/data-table";
import { Pagination } from "@/shared/ui/pagination";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { DataAccessError } from "@/lib/api/errors";
import { useClabeAcciones } from "../hooks/useClabeAcciones";
import { useClabeListado } from "../hooks/useClabeListado";
import { PAGE_SIZES, toClabeTableRow } from "../utils";
import { columns } from "./columns";
import { ClabeDetalleDialog } from "./ClabeDetalleDialog";

/** Usuarios con CLABE: subcuentas con su CLABE (la asigna Cobre) y su habilitación. */
export function ClabePage() {
  const l = useClabeListado();
  const a = useClabeAcciones();

  const err = l.error instanceof DataAccessError ? l.error : null;

  return (
    <PermissionGuard recurso="usuarios">
      <PageHeader
        title="Usuarios con CLABE"
        description="Subcuentas con su CLABE. La CLABE la asigna Cobre al aprobar el alta del cliente (detalle del cliente → pestaña Cobre)."
      />

      {l.isLoading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 text-sm text-muted-foreground">
          <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
          Cargando subcuentas…
        </div>
      ) : l.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-danger-200 bg-danger-50 px-6 py-12 text-center text-sm text-danger-700">
          <AlertTriangle size={28} />
          <p>{err?.message ?? "Error"}</p>
          <button
            onClick={() => l.refetch()}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground"
          >
            Reintentar
          </button>
        </div>
      ) : l.rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          <Inbox size={28} />
          <p>No hay subcuentas que coincidan.</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={l.rows.map(toClabeTableRow)}
            keyExtractor={(r) => r.id}
            actions={(r) => <ActionsDropdown actions={a.getActions(r)} />}
            hidePagination
            serverFilterState={l.filtrosPanel}
            onServerFilterChange={l.aplicarFiltros}
            serverResultCount={l.total}
            extraFilters={
              <div>
                <label className="text-xs font-medium text-muted-foreground">Estado</label>
                <select
                  value={l.estadoFilter}
                  onChange={(e) => l.cambiarEstado(e.target.value)}
                  className="w-full sm:min-w-[130px] h-8 px-2 rounded-md border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <option value="">Todos</option>
                  <option value="Activa">Habilitado</option>
                  <option value="Pausada">Deshabilitado</option>
                </select>
              </div>
            }
          />
          <Pagination
            page={l.page + 1}
            totalPages={l.totalPages}
            pageSize={l.pageSize}
            total={l.total}
            countLabel="subcuentas"
            pageSizes={PAGE_SIZES}
            disabled={l.isFetching}
            onPageChange={(p) => l.setPage(p - 1)}
            onPageSizeChange={l.cambiarPageSize}
          />
        </>
      )}

      <ClabeDetalleDialog viewing={a.viewing} onClose={() => a.setViewing(null)} />
    </PermissionGuard>
  );
}
