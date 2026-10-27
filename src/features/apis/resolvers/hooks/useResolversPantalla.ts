import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useResolvers } from "@/hooks/useResolvers";
import {
  createResolver,
  deleteResolver,
  setResolverEstado,
  updateResolver,
} from "@/lib/api/resolvers";
import { useCan } from "@/lib/permissions";
import type { Resolver, ResolverEstado } from "@/lib/api/types";
import { useListadoFiltros } from "../../hooks/useListadoFiltros";
import { dialogoError, type ConfirmAction } from "../../listado";
import { PAGE_SIZE, resolverFormToInput, type ResolverForm } from "../utils";

/** Filtros, datos, permisos y acciones de la pantalla de resolvers. */
export function useResolversPantalla() {
  const queryClient = useQueryClient();
  const filtros = useListadoFiltros<ResolverEstado>();

  const { can } = useCan();
  const puedeCrear = can("crear", "resolvers");
  const puedeModificar = can("modificar", "resolvers");
  const puedeBorrar = can("borrar", "resolvers");

  const listado = useResolvers({
    page: filtros.page,
    pageSize: PAGE_SIZE,
    search: filtros.search,
    estado: filtros.estadoFilter || undefined,
  });

  const [editTarget, setEditTarget] = useState<Resolver | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Resolver | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["resolvers"] });
  const cerrarAccion = () => setConfirmAction(null);

  const cambiarEstado = async (row: Resolver, nuevo: ResolverEstado) => {
    try {
      await setResolverEstado(row.id, nuevo);
      invalidar();
    } catch (e) {
      setConfirmAction(dialogoError("No se pudo actualizar", e, cerrarAccion));
    }
  };

  const guardar = async (form: ResolverForm) => {
    try {
      if (editTarget) {
        await updateResolver(editTarget.id, resolverFormToInput(form));
      } else {
        await createResolver({ ...resolverFormToInput(form), estado: "Activo" });
      }
      invalidar();
      setShowNew(false);
      setEditTarget(null);
    } catch (e) {
      setConfirmAction(dialogoError("No se pudo guardar", e, cerrarAccion));
    }
  };

  const eliminar = async () => {
    if (!confirmDelete) return;
    try {
      await deleteResolver(confirmDelete.id);
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
