import { Plus } from "lucide-react";
import { PageHeader, BtnPrimary } from "@/components/portal-shell";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { PermissionGuard } from "@/components/permission-guard";
import type { ApiUsuario } from "@/lib/api/types";
import { AvisoDialog } from "../../components/AvisoDialog";
import { ListadoContenido } from "../../components/ListadoContenido";
import { useUsuariosApi } from "../hooks/useUsuariosApi";
import { usuarioAcciones, usuariosColumns } from "./columns";
import { UsuarioDetalleModal } from "./UsuarioDetalleModal";
import { UsuarioFormModal } from "./UsuarioFormModal";
import { UsuariosFiltros } from "./UsuariosFiltros";

/** Pantalla "Usuarios de API" (APIs externas). */
export function UsuariosApiPage() {
  const s = useUsuariosApi();

  const getActions = (row: ApiUsuario) =>
    usuarioAcciones(row, {
      puedeModificar: s.puedeModificar,
      puedeBorrar: s.puedeBorrar,
      onDetalle: s.setDetail,
      onCambiarEstado: s.cambiarEstado,
      onEliminar: s.setConfirmDelete,
    });

  return (
    <PermissionGuard recurso="apis_externas">
      <PageHeader
        title="Usuarios de API"
        description="Usuarios con acceso a las APIs externas de la plataforma."
        action={
          <BtnPrimary type="button" onClick={() => s.setShowNew(true)} disabled={!s.puedeCrear}>
            <Plus size={14} /> Nuevo usuario
          </BtnPrimary>
        }
      />

      <UsuariosFiltros s={s} />

      <ListadoContenido
        isLoading={s.isLoading}
        isError={s.isError}
        isEmpty={s.isEmpty}
        isFetching={s.isFetching}
        err={s.err}
        onRetry={() => s.refetch()}
        cargandoTexto="Cargando usuarios de API…"
        errorTitulo="Ocurrió un error al cargar los usuarios de API"
        vacioTexto="No hay usuarios de API que coincidan con la búsqueda."
        columns={usuariosColumns}
        rows={s.rows}
        getActions={getActions}
        total={s.total}
        totalLabel="usuario(s)"
        page={s.page}
        setPage={s.setPage}
        totalPaginas={s.totalPaginas}
      />

      {s.detail && <UsuarioDetalleModal usr={s.detail} onClose={() => s.setDetail(null)} />}

      {(s.showNew || s.editTarget) && (
        <UsuarioFormModal usuario={s.editTarget} onClose={s.cerrarFormulario} onSave={s.guardar} />
      )}

      <ConfirmDialog
        open={!!s.confirmDelete}
        onClose={() => s.setConfirmDelete(null)}
        title="Eliminar usuario de API"
        message={`¿Estás seguro de eliminar el usuario "${s.confirmDelete?.usuario}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={s.eliminar}
      />

      <AvisoDialog confirmAction={s.confirmAction} onClose={() => s.setConfirmAction(null)} />
    </PermissionGuard>
  );
}
