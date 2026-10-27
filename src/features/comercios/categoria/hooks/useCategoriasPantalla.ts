import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCodigosCategoria } from "@/hooks/useCodigosCategoria";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  createCodigoCategoria,
  deleteCodigoCategoria,
  setCodigoCategoriaEstado,
  updateCodigoCategoria,
} from "@/lib/api/codigos-categoria";
import { useCan } from "@/lib/permissions";
import type { CodigoCategoria } from "@/lib/api/types";
import {
  mensajeErrorGuardado,
  PAGE_SIZE,
  type CategoriaForm,
  type EstadoCategoria,
} from "../utils";

type ConfirmAction = {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "default" | "danger";
  onConfirm: () => void;
};

/** Filtros, datos, permisos y acciones de la pantalla de códigos de categoría. */
export function useCategoriasPantalla() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [estadoFilter, setEstadoFilter] = useState<EstadoCategoria | "">("");

  const { can } = useCan();
  const puedeCrear = can("crear", "comercios");
  const puedeModificar = can("modificar", "comercios");
  const puedeBorrar = can("borrar", "comercios");

  const listado = useCodigosCategoria({
    page,
    pageSize: PAGE_SIZE,
    search,
    estado: estadoFilter || undefined,
  });

  const [editTarget, setEditTarget] = useState<CodigoCategoria | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<CodigoCategoria | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["codigos_categoria"] });
  const avisarError = (title: string, message: string) =>
    setConfirmAction({
      title,
      message,
      confirmLabel: "Cerrar",
      variant: "danger",
      onConfirm: () => setConfirmAction(null),
    });

  const cambiarEstado = async (row: CodigoCategoria, nuevo: EstadoCategoria) => {
    try {
      await setCodigoCategoriaEstado(row.id, nuevo);
      invalidar();
    } catch (e) {
      avisarError("No se pudo actualizar", (e as Error).message);
    }
  };

  const guardar = async (form: CategoriaForm) => {
    try {
      if (editTarget) {
        await updateCodigoCategoria(editTarget.id, {
          codigo: form.codigo,
          nombre: form.nombre,
          descripcion: form.descripcion,
        });
      } else {
        await createCodigoCategoria({
          codigo: form.codigo,
          nombre: form.nombre,
          descripcion: form.descripcion,
          estado: "activo",
        });
      }
      invalidar();
      setShowNew(false);
      setEditTarget(null);
    } catch (e) {
      avisarError("No se pudo guardar", mensajeErrorGuardado(e, form.codigo));
    }
  };

  const eliminar = async () => {
    if (!confirmDelete) return;
    try {
      await deleteCodigoCategoria(confirmDelete.id);
      invalidar();
    } catch (e) {
      avisarError("No se pudo eliminar", (e as Error).message);
    }
    setConfirmDelete(null);
  };

  return {
    page,
    setPage,
    searchInput,
    cambiarBusqueda: (v: string) => {
      setSearchInput(v);
      setPage(0);
    },
    estadoFilter,
    cambiarEstadoFilter: (v: EstadoCategoria | "") => {
      setEstadoFilter(v);
      setPage(0);
    },
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
    setConfirmAction,
    cambiarEstado,
    guardar,
    eliminar,
    cerrarForm: () => {
      setShowNew(false);
      setEditTarget(null);
    },
  };
}
