import { AlertTriangle, Inbox } from "lucide-react";
import { brand } from "@/brand/brand";
import { DataTable } from "@/shared/ui/data-table";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Pagination } from "@/shared/ui/pagination";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { DataAccessError } from "@/lib/api/errors";
import { useEnlacesAcciones } from "../hooks/useEnlacesAcciones";
import { useEnlacesListado } from "../hooks/useEnlacesListado";
import { PAGE_SIZES } from "../utils";
import { columnasEnlaces } from "./columns";
import { EnlaceDetalle } from "./EnlaceDetalle";

/** Links de pago creados desde Enterprise: listado y gestión del ciclo de vida. */
export function EnlacesPage() {
  const l = useEnlacesListado();
  const a = useEnlacesAcciones();
  const err = l.error instanceof DataAccessError ? l.error : null;

  return (
    <PermissionGuard recurso="comercios">
      <PageHeader
        title="Links de Pago"
        description={`Links gestionados por ${brand.name}. PayWay crea en Pendiente; Admin gestiona ciclo completo (ver detalle para método/tarjeta/cuotas).`}
      />
      {l.isLoading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 text-sm text-muted-foreground">
          <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
          Cargando enlaces…
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
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-12 text-sm text-muted-foreground">
          <Inbox size={28} />
          <p>No hay enlaces de pago.</p>
          <p className="text-xs">
            Crea un enlace en Enterprise → aparecerá aquí como Pendiente de aprobación.
          </p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columnasEnlaces}
            data={l.rows}
            keyExtractor={(r) => r.id}
            actions={(r) => <ActionsDropdown actions={a.getActions(r)} />}
            hidePagination
            serverFilterState={l.filtrosPanel}
            onServerFilterChange={l.aplicarFiltros}
            serverResultCount={l.total}
          />
          <Pagination
            page={l.page + 1}
            totalPages={l.totalPages}
            pageSize={l.pageSize}
            total={l.total}
            countLabel="enlace(s)"
            pageSizes={PAGE_SIZES}
            disabled={l.isFetching}
            onPageChange={(p) => l.setPage(p - 1)}
            onPageSizeChange={l.cambiarPageSize}
          />
        </>
      )}
      {a.detail && <EnlaceDetalle enlace={a.detail} onClose={() => a.setDetail(null)} />}
      {a.confirm && (
        <ConfirmDialog
          open={!!a.confirm}
          onClose={() => a.setConfirm(null)}
          title={a.confirm.title}
          message={a.confirm.message}
          confirmLabel={a.confirm.confirmLabel}
          variant={a.confirm.variant}
          onConfirm={a.confirm.onConfirm}
        />
      )}
    </PermissionGuard>
  );
}
