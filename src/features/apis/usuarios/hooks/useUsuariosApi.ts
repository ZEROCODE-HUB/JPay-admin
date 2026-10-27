import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiUsuarios } from "@/hooks/useApiUsuarios";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  createApiUsuario,
  deleteApiUsuario,
  setApiUsuarioEstado,
  updateApiUsuario,
} from "@/lib/api/api-usuarios";
import { DataAccessError } from "@/lib/api/errors";
import { useCan } from "@/lib/permissions";
import type { ApiUsuario, EstadoApiUsuario } from "@/lib/api/types";
import { esErrorDuplicado, LISTADO_PAGE_SIZE, totalPaginas } from "../../listado";
import { useAvisoError } from "../../hooks/useAvisoError";
import { usuarioFormAInput, type UsuarioForm } from "../utils";

/** Estado de la pantalla de usuarios de API: filtros, paginación, modales y acciones. */
export function useUsuariosApi() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [estadoFilter, setEstadoFilter] = useState<EstadoApiUsuario | "">("");

  const { can } = useCan();
  const puedeCrear = can("crear", "apis_externas");
  const puedeModificar = can("modificar", "apis_externas");
  const puedeBorrar = can("borrar", "apis_externas");

  const { rows, total, isLoading, isFetching, isError, error, isEmpty, refetch } = useApiUsuarios({
    page,
    pageSize: LISTADO_PAGE_SIZE,
    search,
    estado: estadoFilter || undefined,
  });

  const err = error instanceof DataAccessError ? error : null;

  const [detail, setDetail] = useState<ApiUsuario | null>(null);
  const [editTarget, setEditTarget] = useState<ApiUsuario | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ApiUsuario | null>(null);
  const { confirmAction, setConfirmAction, avisarError } = useAvisoError();

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["api_usuarios"] });

  const cambiarEstado = async (row: ApiUsuario, nuevo: EstadoApiUsuario) => {
    try {
      await setApiUsuarioEstado(row.id, nuevo);
      invalidar();
    } catch (e) {
      avisarError("No se pudo actualizar", (e as Error).message);
    }
  };

  const guardar = async (form: UsuarioForm) => {
    try {
      if (editTarget) {
        await updateApiUsuario(editTarget.id, usuarioFormAInput(form));
      } else {
        await createApiUsuario(usuarioFormAInput(form));
      }
      invalidar();
      setShowNew(false);
      setEditTarget(null);
    } catch (e) {
      avisarError(
        "No se pudo guardar",
        esErrorDuplicado(e as DataAccessError)
          ? `Ya existe un usuario de API con el código "${form.codigoUsuarioApi.trim()}".`
          : (e as Error).message,
      );
    }
  };

  const eliminar = async () => {
    if (!confirmDelete) return;
    try {
      await deleteApiUsuario(confirmDelete.id);
      invalidar();
    } catch (e) {
      avisarError("No se pudo eliminar", (e as Error).message);
    }
    setConfirmDelete(null);
  };

  const cerrarFormulario = () => {
    setShowNew(false);
    setEditTarget(null);
  };

  return {
    rows,
    total,
    isLoading,
    isFetching,
    isError,
    isEmpty,
    refetch,
    err,
    totalPaginas: totalPaginas(total),
    page,
    setPage,
    searchInput,
    setSearchInput,
    estadoFilter,
    setEstadoFilter,
    puedeCrear,
    puedeModificar,
    puedeBorrar,
    detail,
    setDetail,
    editTarget,
    showNew,
    setShowNew,
    confirmDelete,
    setConfirmDelete,
    confirmAction,
    setConfirmAction,
    cambiarEstado,
    guardar,
    eliminar,
    cerrarFormulario,
  };
}

export type UsuariosApiState = ReturnType<typeof useUsuariosApi>;
