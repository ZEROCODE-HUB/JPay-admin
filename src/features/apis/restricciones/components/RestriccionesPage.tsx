import { Plus } from "lucide-react";
import { PageHeader, BtnPrimary } from "@/components/portal-shell";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { PermissionGuard } from "@/components/permission-guard";
import { DataAccessError } from "@/lib/api/errors";
import { ESTADOS_RESTRICCION } from "@/lib/api/types";
import { AvisoDialog } from "../../components/AvisoDialog";
import { ListadoContenido } from "../../components/ListadoContenido";
import { ListadoFiltros } from "../../components/ListadoFiltros";
import { totalPaginas } from "../../listado";
import { useRestriccionesPantalla } from "../hooks/useRestriccionesPantalla";
import { restriccionAcciones, restriccionColumns } from "./columns";
import { RestriccionFormModal } from "./RestriccionFormModal";

/** Pantalla de restricciones de usuarios de API. */
export function RestriccionesPage() {
  const p = useRestriccionesPantalla();
  const { filtros, listado } = p;

  return (
    <PermissionGuard recurso="apis_externas">
      <PageHeader
        title="Restricciones"
        description="Restricciones de usuarios de API."
        action={
          <BtnPrimary
            type="button"
            onClick={() => p.setShowNew(true)}
            disabled={!p.puedeCrear || p.usuarios.length === 0}
          >
            <Plus size={14} /> Nueva restricción
          </BtnPrimary>
        }
      />

      <ListadoFiltros
        searchInput={filtros.searchInput}
        onSearchChange={filtros.cambiarBusqueda}
        placeholder="Usuario, email, nombre o código…"
        estadoFilter={filtros.estadoFilter}
        onEstadoChange={filtros.cambiarEstadoFilter}
        estados={ESTADOS_RESTRICCION}
      />

      <ListadoContenido
        isLoading={listado.isLoading}
        isFetching={listado.isFetching}
        isError={listado.isError}
        err={listado.error instanceof DataAccessError ? listado.error : null}
        isEmpty={listado.isEmpty}
        onRetry={() => listado.refetch()}
        rows={listado.rows}
        total={listado.total}
        page={filtros.page}
        setPage={filtros.setPage}
        totalPaginas={totalPaginas(listado.total)}
        columns={restriccionColumns}
        getActions={(row) =>
          restriccionAcciones(row, {
            puedeModificar: p.puedeModificar,
            puedeBorrar: p.puedeBorrar,
            onEditar: p.setEditTarget,
            onCambiarEstado: p.cambiarEstado,
            onEliminar: p.setConfirmDelete,
          })
        }
        cargandoTexto="Cargando restricciones…"
        errorTitulo="Ocurrió un error al cargar las restricciones"
        vacioTexto="No hay restricciones que coincidan con la búsqueda."
        totalLabel="restricción(es)"
      />

      {(p.showNew || p.editTarget) && p.usuarios.length > 0 && (
        <RestriccionFormModal
          restriccion={p.editTarget}
          usuarios={p.usuarios}
          onClose={p.cerrarForm}
          onSave={p.guardar}
        />
      )}

      <ConfirmDialog
        open={!!p.confirmDelete}
        onClose={() => p.setConfirmDelete(null)}
        title="Eliminar restricción"
        message={`¿Estás seguro de eliminar la restricción de "${p.confirmDelete?.apiUsuario?.nombreCompleto}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={p.eliminar}
      />

      <AvisoDialog confirmAction={p.confirmAction} onClose={p.cerrarAccion} />
    </PermissionGuard>
  );
}
