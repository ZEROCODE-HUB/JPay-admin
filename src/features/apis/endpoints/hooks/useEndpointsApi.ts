import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiEndpoints } from "@/hooks/useApiEndpoints";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  createApiEndpoint,
  deleteApiEndpoint,
  setApiEndpointEstado,
  updateApiEndpoint,
} from "@/lib/api/api-endpoints";
import { DataAccessError } from "@/lib/api/errors";
import { useCan } from "@/lib/permissions";
import type { ApiEndpoint, EstadoEndpoint, GrupoEndpoint, MetodoHttp } from "@/lib/api/types";
import { esErrorDuplicado, LISTADO_PAGE_SIZE, totalPaginas } from "../../listado";
import { useAvisoError } from "../../hooks/useAvisoError";
import type { EndpointForm } from "../utils";

/** Estado de la pantalla de endpoints: filtros, paginación, modales y acciones. */
export function useEndpointsApi() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [estadoFilter, setEstadoFilter] = useState<EstadoEndpoint | "">("");
  const [grupoFilter, setGrupoFilter] = useState<GrupoEndpoint | "">("");
  const [metodoFilter, setMetodoFilter] = useState<MetodoHttp | "">("");

  const { can } = useCan();
  const puedeCrear = can("crear", "apis_externas");
  const puedeModificar = can("modificar", "apis_externas");
  const puedeBorrar = can("borrar", "apis_externas");

  const { rows, total, isLoading, isFetching, isError, error, isEmpty, refetch } = useApiEndpoints({
    page,
    pageSize: LISTADO_PAGE_SIZE,
    search,
    estado: estadoFilter || undefined,
    grupo: grupoFilter || undefined,
    metodo: metodoFilter || undefined,
  });

  const err = error instanceof DataAccessError ? error : null;

  const [editTarget, setEditTarget] = useState<ApiEndpoint | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ApiEndpoint | null>(null);
  const { confirmAction, setConfirmAction, avisarError } = useAvisoError();

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["api_endpoints"] });

  const cambiarEstado = async (row: ApiEndpoint, nuevo: EstadoEndpoint) => {
    try {
      await setApiEndpointEstado(row.id, nuevo);
      invalidar();
    } catch (e) {
      avisarError("No se pudo actualizar", (e as Error).message);
    }
  };

  const guardar = async (form: EndpointForm) => {
    try {
      if (editTarget) {
        await updateApiEndpoint(editTarget.id, form);
      } else {
        await createApiEndpoint(form);
      }
      invalidar();
      setShowNew(false);
      setEditTarget(null);
    } catch (e) {
      avisarError(
        "No se pudo guardar",
        esErrorDuplicado(e as DataAccessError)
          ? `Ya existe un endpoint con ese path y método.`
          : (e as Error).message,
      );
    }
  };

  const eliminar = async () => {
    if (!confirmDelete) return;
    try {
      await deleteApiEndpoint(confirmDelete.id);
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
    grupoFilter,
    setGrupoFilter,
    metodoFilter,
    setMetodoFilter,
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
    setConfirmAction,
    cambiarEstado,
    guardar,
    eliminar,
    cerrarFormulario,
  };
}

export type EndpointsApiState = ReturnType<typeof useEndpointsApi>;
