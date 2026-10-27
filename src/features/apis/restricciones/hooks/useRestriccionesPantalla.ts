import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiRestricciones } from "@/hooks/useApiRestricciones";
import { useApiUsuarios } from "@/hooks/useApiUsuarios";
import {
  createApiRestriccion,
  deleteApiRestriccion,
  setApiRestriccionEstado,
  updateApiRestriccion,
} from "@/lib/api/api-restricciones";
import type { DataAccessError } from "@/lib/api/errors";
import { useCan } from "@/lib/permissions";
import type { ApiRestriccion, EstadoRestriccion } from "@/lib/api/types";
import { useListadoFiltros } from "../../hooks/useListadoFiltros";
import {
  LISTADO_PAGE_SIZE,
  dialogoError,
  esErrorDuplicado,
  type ConfirmAction,
} from "../../listado";
import type { RestriccionForm } from "../utils";

/** Filtros, datos, permisos y acciones de la pantalla de restricciones. */
export function useRestriccionesPantalla() {
  const queryClient = useQueryClient();
  const filtros = useListadoFiltros<EstadoRestriccion>();

  const { can } = useCan();
  const puedeCrear = can("crear", "apis_externas");
  const puedeModificar = can("modificar", "apis_externas");
  const puedeBorrar = can("borrar", "apis_externas");

  const listado = useApiRestricciones({
    page: filtros.page,
    pageSize: LISTADO_PAGE_SIZE,
    search: filtros.search,
    estado: filtros.estadoFilter || undefined,
  });

  const { rows: usuarios } = useApiUsuarios({ page: 0, pageSize: 500 });

  const [editTarget, setEditTarget] = useState<ApiRestriccion | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ApiRestriccion | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["api_restricciones"] });
  const cerrarAccion = () => setConfirmAction(null);

  const cambiarEstado = async (row: ApiRestriccion, nuevo: EstadoRestriccion) => {
    try {
      await setApiRestriccionEstado(row.id, nuevo);
      invalidar();
    } catch (e) {
      setConfirmAction(dialogoError("No se pudo actualizar", e, cerrarAccion));
    }
  };

  const guardar = async (form: RestriccionForm) => {
    try {
      if (editTarget) {
        await updateApiRestriccion(editTarget.id, {
          estado: form.estado,
          fechaExpiracion: form.fechaExpiracion || null,
        });
      } else {
        await createApiRestriccion({
          apiUsuarioId: form.apiUsuarioId,
          estado: form.estado,
          fechaExpiracion: form.fechaExpiracion || null,
        });
      }
      invalidar();
      setShowNew(false);
      setEditTarget(null);
    } catch (e) {
      const duplicado = esErrorDuplicado(e as DataAccessError);
      setConfirmAction(
        dialogoError(
          "No se pudo guardar",
          e,
          cerrarAccion,
          duplicado ? `Ya existe una restricción para ese usuario.` : (e as Error).message,
        ),
      );
    }
  };

  const eliminar = async () => {
    if (!confirmDelete) return;
    try {
      await deleteApiRestriccion(confirmDelete.id);
      invalidar();
    } catch (e) {
      setConfirmAction(dialogoError("No se pudo eliminar", e, cerrarAccion));
    }
    setConfirmDelete(null);
  };

  const cerrarForm = () => {
    setShowNew(false);
    setEditTarget(null);
  };

  return {
    filtros,
    listado,
    usuarios,
    puedeCrear,
    puedeModificar,
    puedeBorrar,
    editTarget,
    setEditTarget,
    showNew,
    setShowNew,
    confirmDelete,
    setConfirmDelete,
    confirmAction,
    cerrarAccion,
    cambiarEstado,
    guardar,
    eliminar,
    cerrarForm,
  };
}
