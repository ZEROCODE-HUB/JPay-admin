import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useImpuestos } from "@/hooks/useImpuestos";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  createImpuesto,
  deleteImpuesto,
  setImpuestoEstado,
  updateImpuesto,
} from "@/lib/api/impuestos";
import { DataAccessError } from "@/lib/api/errors";
import { useCan } from "@/lib/permissions";
import type { Impuesto } from "@/lib/api/types";
import type { ConfirmActionState, EstadoFiltro } from "../../types";
import { dialogoError } from "../../utils";
import {
  PAGE_SIZE,
  contarPorAmbito,
  esErrorDuplicado,
  filtrarPorAmbito,
  impuestoPayload,
  type ImpuestoForm,
  type TabAmbito,
} from "../utils";

/** Filtros, pestañas, datos y acciones del catálogo de impuestos. */
export function useImpuestosCatalogo() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [estadoFilter, setEstadoFilter] = useState<EstadoFiltro>("");
  const [tab, setTab] = useState<TabAmbito>("externos");

  const { can } = useCan();
  const puedeCrear = can("crear", "impuestos");
  const puedeModificar = can("modificar", "impuestos");
  const puedeBorrar = can("borrar", "impuestos");

  const listado = useImpuestos({
    page,
    pageSize: PAGE_SIZE,
    search,
    estado: estadoFilter || undefined,
  });
  const { rows } = listado;

  const filteredRows = useMemo(() => filtrarPorAmbito(rows, tab), [rows, tab]);
  const conteo = useMemo(() => contarPorAmbito(rows), [rows]);

  const [detail, setDetail] = useState<Impuesto | null>(null);
  const [editTarget, setEditTarget] = useState<Impuesto | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Impuesto | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null);
  const cerrarDialogo = () => setConfirmAction(null);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["impuestos"] });

  const cambiarTab = (t: TabAmbito) => {
    setTab(t);
    setPage(0);
  };
  const cambiarBusqueda = (v: string) => {
    setSearchInput(v);
    setPage(0);
  };
  const cambiarEstado = (v: EstadoFiltro) => {
    setEstadoFilter(v);
    setPage(0);
  };

  const toggleEstado = async (row: Impuesto) => {
    try {
      await setImpuestoEstado(row.id, row.estado === "Activo" ? "Inactivo" : "Activo");
      invalidar();
    } catch (e) {
      setConfirmAction(dialogoError("No se pudo actualizar", (e as Error).message, cerrarDialogo));
    }
  };

  const guardar = async (form: ImpuestoForm) => {
    const payload = impuestoPayload(form);
    try {
      if (editTarget) {
        await updateImpuesto(editTarget.id, payload);
      } else {
        await createImpuesto(payload);
      }
      invalidar();
      setShowNew(false);
      setEditTarget(null);
    } catch (e) {
      const mensaje = esErrorDuplicado(e as DataAccessError)
        ? `Ya existe un impuesto con el código "${form.codigo.trim()}".`
        : (e as Error).message;
      setConfirmAction(dialogoError("No se pudo guardar", mensaje, cerrarDialogo));
    }
  };

  const eliminar = async () => {
    if (!confirmDelete) return;
    try {
      await deleteImpuesto(confirmDelete.id);
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
    listado,
    page,
    setPage,
    searchInput,
    cambiarBusqueda,
    estadoFilter,
    cambiarEstado,
    tab,
    cambiarTab,
    filteredRows,
    conteo,
    puedeCrear,
    puedeModificar,
    puedeBorrar,
    detail,
    setDetail,
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

export type CatalogoState = ReturnType<typeof useImpuestosCatalogo>;
