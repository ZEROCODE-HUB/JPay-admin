import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { pageTitle } from "@/brand/brand";
import { BtnPrimary, PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { DataTable } from "@/shared/ui/data-table";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Pagination } from "@/shared/ui/pagination";
import { DataAccessError } from "@/lib/api/errors";
import { useCargaComisiones } from "@/features/clientes/comisiones/hooks/useCargaComisiones";
import {
  accionesComision,
  columnasComisiones,
} from "@/features/clientes/comisiones/components/columns";
import { ComisionesFiltrosExtra } from "@/features/clientes/comisiones/components/ComisionesFiltrosExtra";
import { ComisionDetalleModal } from "@/features/clientes/comisiones/components/ComisionDetalleModal";
import { ComisionFormModal } from "@/features/clientes/comisiones/components/ComisionFormModal";
import { EstadoMensaje } from "@/features/clientes/comisiones/components/EstadoMensaje";
import { PAGE_SIZES } from "@/features/clientes/comisiones/utils";

export const Route = createFileRoute("/admin/general/usuarios/comisiones")({
  head: () => ({
    meta: [
      { title: pageTitle("Carga de comisiones — Usuarios — Admin") },
      {
        name: "description",
        content: "Gestión de comisiones asignadas a usuarios de la plataforma.",
      },
    ],
  }),
  component: ComisionesPage,
});

function ComisionesPage() {
  const s = useCargaComisiones();
  const { isLoading, isFetching, isError, error, refetch, total } = s.listado;
  const totalPaginas = Math.max(1, Math.ceil(total / s.pageSize));
  const err = error instanceof DataAccessError ? error : null;

  return (
    <PermissionGuard recurso="usuarios">
      <PageHeader
        title="Carga de comisiones"
        description="Comisión e IVA de Retiro (transferencias salientes) y Depósito (ingresos al CVU), por CVU o para toda la cuenta del cliente como respaldo. La del CVU manda. Entre CVUs del mismo cliente no se cobra."
        action={
          <BtnPrimary onClick={s.abrirNueva} disabled={!s.puedeCrear}>
            <Plus size={16} />
            Nueva comisión
          </BtnPrimary>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
          <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
          Cargando comisiones…
        </div>
      ) : isError ? (
        <EstadoMensaje
          tipo={err?.permission ? "permiso" : "error"}
          mensaje={err?.message ?? "Error desconocido"}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <DataTable
            columns={columnasComisiones}
            data={s.data}
            keyExtractor={(r) => r.id}
            actions={(r) => <ActionsDropdown actions={accionesComision(s, r)} />}
            hidePagination
            extraFilters={<ComisionesFiltrosExtra s={s} />}
            serverFilterState={s.filtrosPanel}
            onServerFilterChange={s.aplicarFiltros}
            serverResultCount={total}
            emptyMessage="No hay comisiones que coincidan con los filtros."
          />
          <Pagination
            page={s.page + 1}
            totalPages={totalPaginas}
            pageSize={s.pageSize}
            total={total}
            countLabel="comisión(es)"
            pageSizes={PAGE_SIZES}
            disabled={isFetching}
            onPageChange={(p) => s.setPage(p - 1)}
            onPageSizeChange={(size) => {
              s.setPageSize(size);
              s.setPage(0);
            }}
          />
        </>
      )}

      {s.viewing && <ComisionDetalleModal viewing={s.viewing} onClose={() => s.setViewing(null)} />}

      {(s.editTarget || s.showNueva) && <ComisionFormModal s={s} />}

      {s.confirmAction && (
        <ConfirmDialog
          open={!!s.confirmAction}
          onClose={() => s.setConfirmAction(null)}
          title={s.confirmAction.title}
          message={s.confirmAction.message}
          confirmLabel={s.confirmAction.confirmLabel}
          variant={s.confirmAction.variant}
          onConfirm={s.confirmAction.onConfirm}
        />
      )}
    </PermissionGuard>
  );
}
