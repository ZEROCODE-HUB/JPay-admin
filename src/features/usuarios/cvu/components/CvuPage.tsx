import { AlertTriangle, Inbox, Plus } from "lucide-react";
import { DataTable } from "@/shared/ui/data-table";
import { Pagination } from "@/shared/ui/pagination";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { BtnPrimary, PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { DataAccessError } from "@/lib/api/errors";
import { useCvuAcciones } from "../hooks/useCvuAcciones";
import { useCvuListado } from "../hooks/useCvuListado";
import { useNuevoCvu } from "../hooks/useNuevoCvu";
import { PAGE_SIZES, toCvuTableRow } from "../utils";
import { columns } from "./columns";
import { CvuDetalleDialog, CvuEditarDialog } from "./CvuDialogs";
import { NuevoCvuDialog } from "./NuevoCvuDialog";

/** Usuarios con CVU: listado de subcuentas con alta, edición y habilitación. */
export function CvuPage() {
  const l = useCvuListado();
  const nuevo = useNuevoCvu();
  const a = useCvuAcciones();

  const err = l.error instanceof DataAccessError ? l.error : null;

  return (
    <PermissionGuard recurso="usuarios">
      <PageHeader
        title="Usuarios con CVU"
        description="Cuentas Virtuales creadas — búsqueda rápida por email, refleja en detalle Subcuentas y CVUs recientes."
        action={
          <BtnPrimary onClick={() => nuevo.setShowNuevo(true)} disabled={!a.puedeCrear}>
            <Plus size={16} /> Nuevo CVU
          </BtnPrimary>
        }
      />

      {l.isLoading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 text-sm text-muted-foreground">
          <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
          Cargando CVU…
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
          <p>No hay CVU que coincidan.</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={l.rows.map(toCvuTableRow)}
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
            countLabel="CVU"
            pageSizes={PAGE_SIZES}
            disabled={l.isFetching}
            onPageChange={(p) => l.setPage(p - 1)}
            onPageSizeChange={l.cambiarPageSize}
          />
        </>
      )}

      <CvuDetalleDialog viewing={a.viewing} onClose={() => a.setViewing(null)} />

      <CvuEditarDialog
        editTarget={a.editTarget}
        editAlias={a.editAlias}
        onAliasChange={a.setEditAlias}
        onClose={() => a.setEditTarget(null)}
        onSubmit={a.guardarEdicion}
      />

      <NuevoCvuDialog n={nuevo} />
    </PermissionGuard>
  );
}
