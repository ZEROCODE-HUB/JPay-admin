import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useImpuestosAsignaciones } from "@/hooks/useImpuestos";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  createImpuestoAsignacion,
  deleteImpuestoAsignacion,
  setImpuestoAsignacionEstado,
  updateImpuestoAsignacion,
} from "@/lib/api/impuestos";
import { DataAccessError } from "@/lib/api/errors";
import { useCan } from "@/lib/permissions";
import type { ImpuestoAsignacion } from "@/lib/api/types";
import type { ConfirmActionState, EstadoFiltro } from "../../types";
import { dialogoError } from "../../utils";
import {
  PAGE_SIZE,
  asignacionCreatePayload,
  asignacionUpdatePayload,
  esErrorFk,
  type AsignacionForm,
} from "../utils";

export type TabAsignaciones = "asignaciones" | "por_cobrar";

/** Filtros, datos y acciones de la pantalla "Usuarios con impuestos". */
export function useAsignacionesImpuestos() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabAsignaciones>("asignaciones");
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [estadoFilter, setEstadoFilter] = useState<EstadoFiltro>("");
  // Fechas desde/hasta: se muestran en la card de filtros pero el listado no las usa.
  const [searchDesde, setSearchDesde] = useState("");
  const [searchHasta, setSearchHasta] = useState("");

  const { can } = useCan();
  const puedeCrear = can("crear", "impuestos");
  const puedeModificar = can("modificar", "impuestos");
  const puedeBorrar = can("borrar", "impuestos");

  const listado = useImpuestosAsignaciones({
    page,
    pageSize: PAGE_SIZE,
    search,
    estado: estadoFilter || undefined,
  });

  const [editTarget, setEditTarget] = useState<ImpuestoAsignacion | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ImpuestoAsignacion | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null);
  const cerrarDialogo = () => setConfirmAction(null);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["impuestos_asignaciones"] });

  /** Cambia un filtro y vuelve a la primera página. */
  const conReset =
    <T>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(0);
    };

  const toggleEstado = async (row: ImpuestoAsignacion) => {
    try {
      await setImpuestoAsignacionEstado(row.id, row.estado === "Activo" ? "Inactivo" : "Activo");
      invalidar();
    } catch (e) {
      setConfirmAction(dialogoError("No se pudo actualizar", (e as Error).message, cerrarDialogo));
    }
  };

  const guardar = async (form: AsignacionForm) => {
    try {
      if (editTarget) {
        await updateImpuestoAsignacion(editTarget.id, asignacionUpdatePayload(form));
      } else {
        await createImpuestoAsignacion(asignacionCreatePayload(form));
      }
      invalidar();
      setShowNew(false);
      setEditTarget(null);
    } catch (e) {
      const mensaje = esErrorFk(e as DataAccessError)
        ? `El legajo "${form.clienteLegajo.trim()}" no existe en la tabla de clientes. Verificá el formato (LPF/LPJ-CUIT).`
        : (e as Error).message;
      setConfirmAction(dialogoError("No se pudo guardar", mensaje, cerrarDialogo));
    }
  };

  const eliminar = async () => {
    if (!confirmDelete) return;
    try {
      await deleteImpuestoAsignacion(confirmDelete.id);
      invalidar();
    } catch (e) {
      setConfirmAction(dialogoError("No se pudo eliminar", (e as Error).message, cerrarDialogo));
    }
    setConfirmDelete(null);
  };

  const cerrarForm = () => {
    setShowNew(false);
    setEditTarget(null);
  };

  return {
    tab,
    setTab,
    listado,
    page,
    setPage,
    searchInput,
    cambiarBusqueda: conReset(setSearchInput),
    estadoFilter,
    cambiarEstado: conReset(setEstadoFilter),
    searchDesde,
    cambiarDesde: conReset(setSearchDesde),
    searchHasta,
    cambiarHasta: conReset(setSearchHasta),
    puedeCrear,
    puedeModificar,
    puedeBorrar,
    editTarget,
    setEditTarget,
    showNew,
    setShowNew,
    cerrarForm,
    confirmDelete,
    setConfirmDelete,
    confirmAction,
    cerrarDialogo,
    toggleEstado,
    guardar,
    eliminar,
  };
}

export type AsignacionesState = ReturnType<typeof useAsignacionesImpuestos>;
