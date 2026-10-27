import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useComercios, useClientesForSelect } from "@/hooks/useComercios";
import { useCodigosCategoria } from "@/hooks/useCodigosCategoria";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  createComercio,
  deshabilitarComercio,
  setComercioEstado,
  updateComercio,
} from "@/lib/api/comercios";
import { useCan } from "@/lib/permissions";
import type { Comercio, EstadoComercio, NivelComercio } from "@/lib/api/types";
import type { ComercioFormInput } from "../utils";

export type ConfirmActionState = {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "default" | "danger";
  onConfirm: () => void;
};

/** Filtros, paginación, datos y acciones de la pantalla de gestión de comercios. */
export function useComerciosGestion() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [estadoFilter, setEstadoFilter] = useState<EstadoComercio | "">("");
  const [nivelFilter, setNivelFilter] = useState<NivelComercio | "">("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const { can } = useCan();
  const puedeCrear = can("crear", "comercios");
  const puedeModificar = can("modificar", "comercios");

  const listado = useComercios({
    page,
    pageSize,
    search,
    estado: estadoFilter || undefined,
    nivel: nivelFilter || undefined,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
  });

  const { rows: categorias } = useCodigosCategoria({ page: 0, pageSize: 1000 });
  const { data: clientes } = useClientesForSelect();
  const { rows: adminUsers } = useAdminUsers({ page: 0, pageSize: 100 });

  const [detail, setDetail] = useState<Comercio | null>(null);
  const [editTarget, setEditTarget] = useState<Comercio | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Comercio | null>(null);
  const [deshabilitarMotivo, setDeshabilitarMotivo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["comercios"] });

  const mostrarError = (title: string, e: unknown) =>
    setConfirmAction({
      title,
      message: (e as Error).message,
      confirmLabel: "Cerrar",
      variant: "danger",
      onConfirm: () => setConfirmAction(null),
    });

  const cambiarEstado = async (row: Comercio, nuevo: EstadoComercio) => {
    try {
      await setComercioEstado(row.id, nuevo);
      invalidar();
    } catch (e) {
      mostrarError("No se pudo actualizar", e);
    }
  };

  const cerrarForm = () => {
    setShowNew(false);
    setEditTarget(null);
  };

  const guardar = async (input: ComercioFormInput) => {
    setIsSaving(true);
    try {
      const datos = {
        usuario: input.usuario,
        nombreComercio: input.nombreComercio,
        categoriaId: input.categoriaId,
        nivel: input.nivel,
        estado: input.estado,
        ejecutivoResponsableId: input.ejecutivoResponsableId,
        siteId: input.siteId,
      };
      if (editTarget) {
        await updateComercio(editTarget.id, datos);
      } else {
        await createComercio({ legajo: input.clienteLegajo, ...datos });
      }
      invalidar();
      cerrarForm();
    } catch (e) {
      mostrarError("No se pudo guardar", e);
    } finally {
      setIsSaving(false);
    }
  };

  const cerrarDeshabilitar = () => {
    setConfirmDelete(null);
    setDeshabilitarMotivo("");
  };

  const deshabilitar = async () => {
    if (!confirmDelete || !deshabilitarMotivo.trim()) return;
    try {
      await deshabilitarComercio(confirmDelete.id, deshabilitarMotivo.trim());
      invalidar();
    } catch (e) {
      mostrarError("No se pudo deshabilitar", e);
    }
    cerrarDeshabilitar();
  };

  const hayFiltros = !!(fechaDesde || fechaHasta || estadoFilter || nivelFilter || searchInput);
  const limpiarFiltros = () => {
    setSearchInput("");
    setEstadoFilter("");
    setNivelFilter("");
    setFechaDesde("");
    setFechaHasta("");
    setPage(0);
  };

  return {
    // filtros y paginación
    page,
    setPage,
    pageSize,
    setPageSize,
    searchInput,
    setSearchInput,
    estadoFilter,
    setEstadoFilter,
    nivelFilter,
    setNivelFilter,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    hayFiltros,
    limpiarFiltros,
    // datos
    listado,
    categorias,
    clientes,
    adminUsers,
    puedeCrear,
    puedeModificar,
    // modales y acciones
    detail,
    setDetail,
    editTarget,
    setEditTarget,
    showNew,
    setShowNew,
    cerrarForm,
    isSaving,
    guardar,
    cambiarEstado,
    confirmDelete,
    setConfirmDelete,
    cerrarDeshabilitar,
    deshabilitarMotivo,
    setDeshabilitarMotivo,
    deshabilitar,
    confirmAction,
    setConfirmAction,
  };
}

export type ComerciosGestionState = ReturnType<typeof useComerciosGestion>;
