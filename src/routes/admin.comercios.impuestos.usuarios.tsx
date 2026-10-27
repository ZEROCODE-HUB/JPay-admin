import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { pageTitle } from "@/brand/brand";
import { PageHeader, BtnPrimary } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { DataTable } from "@/shared/ui/data-table";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { DataAccessError } from "@/lib/api/errors";
import { useAsignacionesImpuestos } from "@/features/impuestos/asignaciones/hooks/useAsignacionesImpuestos";
import { AsignacionesFiltros } from "@/features/impuestos/asignaciones/components/AsignacionesFiltros";
import {
  AsignacionesTabs,
  ImpuestosPorCobrarTab,
} from "@/features/impuestos/asignaciones/components/AsignacionesTabs";
import { AsignacionFormModal } from "@/features/impuestos/asignaciones/components/AsignacionFormModal";
import {
  accionesAsignacion,
  columnasAsignaciones,
} from "@/features/impuestos/asignaciones/components/columns";
import { PAGE_SIZE } from "@/features/impuestos/asignaciones/utils";
import { ListadoPaginado } from "@/features/impuestos/components/ListadoPaginado";
import { ConfirmActionDialog } from "@/features/impuestos/components/ConfirmActionDialog";

export const Route = createFileRoute("/admin/comercios/impuestos/usuarios")({
  head: () => ({ meta: [{ title: pageTitle("Usuarios con impuestos — Admin") }] }),
  component: Page,
});

function Page() {
  const s = useAsignacionesImpuestos();
  const { listado } = s;

  return (
    <PermissionGuard recurso="impuestos">
      <PageHeader
        title="Usuarios con impuestos"
        description="Asignaciones de impuestos a clientes."
        action={
          <BtnPrimary type="button" onClick={() => s.setShowNew(true)} disabled={!s.puedeCrear}>
            <Plus size={14} /> Nueva asignación
          </BtnPrimary>
        }
      />

      <AsignacionesTabs tab={s.tab} onChange={s.setTab} />

      {s.tab === "por_cobrar" ? (
        <ImpuestosPorCobrarTab />
      ) : (
        <>
          <AsignacionesFiltros s={s} />

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
              cargando: "Cargando asignaciones…",
              errorTitulo: "Ocurrió un error al cargar las asignaciones",
              vacio: "No hay asignaciones que coincidan con la búsqueda.",
              contador: "asignacion(es)",
            }}
          >
            <DataTable
              columns={columnasAsignaciones}
              data={listado.rows}
              keyExtractor={(r) => r.id}
              pageSize={PAGE_SIZE}
              showDownloadButton={false}
              actions={(r) => <ActionsDropdown actions={accionesAsignacion(s, r)} />}
            />
          </ListadoPaginado>
        </>
      )}

      {(s.showNew || s.editTarget) && (
        <AsignacionFormModal asignacion={s.editTarget} onClose={s.cerrarForm} onSave={s.guardar} />
      )}

      <ConfirmDialog
        open={!!s.confirmDelete}
        onClose={() => s.setConfirmDelete(null)}
        title="Eliminar asignación"
        message={`¿Eliminar la asignación de ${s.confirmDelete?.clienteLegajo ?? ""}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={s.eliminar}
      />

      <ConfirmActionDialog action={s.confirmAction} onClose={s.cerrarDialogo} />
    </PermissionGuard>
  );
}
