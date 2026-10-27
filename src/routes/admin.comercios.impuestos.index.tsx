import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { pageTitle } from "@/brand/brand";
import { PageHeader, BtnPrimary } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { DataTable } from "@/shared/ui/data-table";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { DataAccessError } from "@/lib/api/errors";
import { useImpuestosCatalogo } from "@/features/impuestos/catalogo/hooks/useImpuestosCatalogo";
import { CatalogoFiltros } from "@/features/impuestos/catalogo/components/CatalogoFiltros";
import {
  accionesImpuesto,
  columnasImpuestos,
} from "@/features/impuestos/catalogo/components/columns";
import { ImpuestoDetalleModal } from "@/features/impuestos/catalogo/components/ImpuestoDetalleModal";
import { ImpuestoFormModal } from "@/features/impuestos/catalogo/components/ImpuestoFormModal";
import { PAGE_SIZE } from "@/features/impuestos/catalogo/utils";
import { ListadoPaginado } from "@/features/impuestos/components/ListadoPaginado";
import { ConfirmActionDialog } from "@/features/impuestos/components/ConfirmActionDialog";

export const Route = createFileRoute("/admin/comercios/impuestos/")({
  component: Page,
  head: () => ({
    meta: [{ title: pageTitle("Impuestos — Admin") }],
  }),
});

function Page() {
  const s = useImpuestosCatalogo();
  const { listado } = s;

  return (
    <PermissionGuard recurso="impuestos">
      <PageHeader
        title="Impuestos"
        description="Catálogo de tipos de impuestos de la plataforma y su monto."
        action={
          <BtnPrimary type="button" onClick={() => s.setShowNew(true)} disabled={!s.puedeCrear}>
            <Plus size={14} /> Nuevo impuesto
          </BtnPrimary>
        }
      />

      <CatalogoFiltros s={s} />

      <ListadoPaginado
        isLoading={listado.isLoading}
        isError={listado.isError}
        isEmpty={listado.isEmpty}
        isFetching={listado.isFetching}
        error={listado.error instanceof DataAccessError ? listado.error : null}
        onRetry={() => listado.refetch()}
        page={s.page}
        setPage={s.setPage}
        total={listado.total}
        pageSize={PAGE_SIZE}
        textos={{
          cargando: "Cargando impuestos…",
          errorTitulo: "Ocurrió un error al cargar los impuestos",
          vacio: "No hay impuestos que coincidan con la búsqueda.",
          contador: "impuesto(s)",
        }}
      >
        <DataTable
          columns={columnasImpuestos}
          data={s.filteredRows}
          keyExtractor={(r) => r.id}
          pageSize={PAGE_SIZE}
          showDownloadButton={false}
          actions={(r) => <ActionsDropdown actions={accionesImpuesto(s, r)} />}
        />
      </ListadoPaginado>

      {s.detail && <ImpuestoDetalleModal imp={s.detail} onClose={() => s.setDetail(null)} />}

      {(s.showNew || s.editTarget) && (
        <ImpuestoFormModal impuesto={s.editTarget} onClose={s.cerrarForm} onSave={s.guardar} />
      )}

      <ConfirmDialog
        open={!!s.confirmDelete}
        onClose={() => s.setConfirmDelete(null)}
        title="Eliminar impuesto"
        message={`¿Estás seguro de eliminar el impuesto "${s.confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={s.eliminar}
      />

      <ConfirmActionDialog action={s.confirmAction} onClose={s.cerrarDialogo} />
    </PermissionGuard>
  );
}
