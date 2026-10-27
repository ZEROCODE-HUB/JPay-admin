import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { TableServerFilters } from "@/shared/ui/data-table";
import { useComisiones } from "@/hooks/useComisiones";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { listComisiones, setComisionEstado, upsertComision } from "@/lib/api/comisiones";
import { getClienteByCorreo } from "@/lib/api/clientes";
import { useCan } from "@/lib/permissions";
import type { EstadoComision, ModalidadComision, TipoOperacion } from "@/lib/api/types";
import {
  TIPOS_COMISION_USUARIOS,
  codigoOperacionNuevo,
  comisionDesdeApi,
  desgloseDe,
  draftDesdeComision,
  draftVacio,
  otraActivaMismoAlcance,
  type Comision,
  type ComisionDraft,
} from "../utils";

export type ConfirmActionState = {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "default" | "danger";
  onConfirm: () => void;
};

export type Alcance = "" | "cvu" | "cuenta";

/** Busca las comisiones habilitadas del cliente para ese tipo (primeras 20). */
const activasDelCliente = (clienteId: string, tipo: TipoOperacion) =>
  listComisiones({ clienteId, tipo, estado: "Habilitado", page: 0, pageSize: 20 });

/** Filtros, datos, formulario y acciones de la carga de comisiones de usuarios. */
export function useCargaComisiones() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filtros de la card: server-side contra toda la base.
  const [filtrosPanel, setFiltrosPanel] = useState<TableServerFilters>({
    global: "",
    enums: {},
    dates: {},
  });
  const search = useDebouncedValue(filtrosPanel.global.trim(), 350);
  const aplicarFiltros = (f: TableServerFilters) => {
    setPage(0);
    setFiltrosPanel(f);
  };
  const [alcance, setAlcance] = useState<Alcance>("");
  const [legajoFiltro, setLegajoFiltro] = useState("");
  const [cvuFiltro, setCvuFiltro] = useState("");
  const legajoQ = useDebouncedValue(legajoFiltro.trim(), 350);
  const cvuQ = useDebouncedValue(cvuFiltro.trim(), 350);

  // Depósito y Retiro se filtran en la base: así el total y las páginas coinciden.
  const listado = useComisiones({
    page,
    pageSize,
    search: search || undefined,
    tipo: (filtrosPanel.enums.tipo as TipoOperacion) || undefined,
    tipos: TIPOS_COMISION_USUARIOS,
    modalidad: (filtrosPanel.enums.modalidad as ModalidadComision) || undefined,
    estado: (filtrosPanel.enums.estado as EstadoComision) || undefined,
    alcance: alcance || undefined,
    legajo: legajoQ || undefined,
    cvu: cvuQ || undefined,
  });

  const [viewing, setViewing] = useState<Comision | null>(null);
  const [editTarget, setEditTarget] = useState<Comision | null>(null);
  const [showNueva, setShowNueva] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null);

  const { can } = useCan();
  const puedeCrear = can("crear", "usuarios");
  const puedeModificar = can("modificar", "usuarios");

  const data: Comision[] = listado.rows.map(comisionDesdeApi);

  const [draft, setDraft] = useState<ComisionDraft>(draftVacio);

  const abrirNueva = () => {
    setDraft(draftVacio());
    setFormError(null);
    setShowNueva(true);
  };

  const abrirEdicion = (c: Comision) => {
    setDraft(draftDesdeComision(c));
    setFormError(null);
    setEditTarget(c);
  };

  const cerrarForm = () => {
    setEditTarget(null);
    setShowNueva(false);
  };

  const errorDialogo = (title: string, message: string) =>
    setConfirmAction({
      title,
      message,
      confirmLabel: "Cerrar",
      variant: "danger",
      onConfirm: () => setConfirmAction(null),
    });

  const cambiarEstado = async (row: Comision, nuevo: EstadoComision) => {
    try {
      // Solo puede haber UNA comision Habilitada por CVU (o por cliente) y tipo:
      // antes de activar esta, se verifica que no haya otra activa del mismo alcance.
      if (nuevo === "Habilitado") {
        const cliente = await getClienteByCorreo(row.correo.toLowerCase());
        if (cliente) {
          const activas = await activasDelCliente(cliente.id, row.tipo);
          if (otraActivaMismoAlcance(activas.rows, row.id, row.subcuentaId)) {
            const alcanceTxt = row.cvu ? `el CVU ${row.cvu}` : "toda la cuenta";
            errorDialogo(
              "Ya hay una comisión activa de ese tipo",
              `Ya hay una comisión de "${row.tipo}" habilitada para ${alcanceTxt}. Deshabilitá esa antes de activar otra.`,
            );
            return;
          }
        }
      }

      await setComisionEstado(row.id, nuevo);
      queryClient.invalidateQueries({ queryKey: ["comisiones"] });
    } catch (e) {
      errorDialogo("No se pudo actualizar", (e as Error).message);
    }
  };

  const pedirCambioEstado = (row: Comision) =>
    setConfirmAction(
      row.estado === "Habilitado"
        ? {
            title: "Deshabilitar comisión",
            message: `¿Estás seguro de deshabilitar la comisión ${row.legajo}?`,
            confirmLabel: "Deshabilitar",
            variant: "danger",
            onConfirm: () => cambiarEstado(row, "Deshabilitado"),
          }
        : {
            title: "Habilitar comisión",
            message: `¿Estás seguro de habilitar la comisión ${row.legajo}?`,
            confirmLabel: "Habilitar",
            variant: "default",
            onConfirm: () => cambiarEstado(row, "Habilitado"),
          },
    );

  const guardarDraft = async () => {
    setFormError(null);
    if (!draft.correo) {
      setFormError("Seleccioná el email del cliente (búsqueda rápida).");
      return;
    }
    setSaving(true);
    try {
      const cliente = await getClienteByCorreo(draft.correo.trim().toLowerCase());
      if (!cliente) {
        setFormError("No existe un cliente con ese correo. Dalo de alta primero.");
        setSaving(false);
        return;
      }

      // Solo puede haber UNA comision HABILITADA por alcance (CVU, o cliente si no
      // hay CVU) y tipo: se pueden guardar deshabilitadas, pero no dos activas del
      // mismo alcance a la vez.
      if (draft.estado === "Habilitado") {
        const activas = await activasDelCliente(cliente.id, draft.tipo);
        if (otraActivaMismoAlcance(activas.rows, draft.id, draft.subcuentaId)) {
          const alcanceTxt = draft.subcuentaId
            ? `el CVU elegido`
            : `toda la cuenta de ${cliente.correo}`;
          setFormError(
            `Ya hay una comisión de "${draft.tipo}" activa para ${alcanceTxt}. Deshabilitá esa, o guardá esta como "Deshabilitado".`,
          );
          setSaving(false);
          return;
        }
      }
      await upsertComision({
        id: draft.id,
        clienteId: cliente.id,
        subcuentaId: draft.subcuentaId,
        // Código único por cliente (constraint comision_unica_por_operacion).
        operacion: draft.id
          ? (editTarget?.operacion ?? "")
          : codigoOperacionNuevo(draft, Date.now()),
        tipo: draft.tipo,
        modalidad: draft.modalidad,
        porcentaje: draft.modalidad === "Porcentaje" ? draft.porcentaje : null,
        montoFijo: draft.modalidad === "Fijo" ? draft.montoFijo : null,
        porcentajeImpuesto: draft.porcentajeImpuesto,
        estado: draft.estado,
        descripcion: draft.descripcion,
      });
      queryClient.invalidateQueries({ queryKey: ["comisiones"] });
      queryClient.invalidateQueries({ queryKey: ["comisiones_cliente", cliente.legajo] });
      queryClient.invalidateQueries({ queryKey: ["comisiones", "by-legajo", cliente.legajo] });
      // fuerza refetch del detalle si está abierto
      queryClient.invalidateQueries({ queryKey: ["subcuentas", cliente.legajo] });
      setShowNueva(false);
      setEditTarget(null);
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return {
    listado,
    data,
    page,
    setPage,
    pageSize,
    setPageSize,
    filtrosPanel,
    aplicarFiltros,
    alcance,
    setAlcance,
    legajoFiltro,
    setLegajoFiltro,
    cvuFiltro,
    setCvuFiltro,
    puedeCrear,
    puedeModificar,
    viewing,
    setViewing,
    editTarget,
    showNueva,
    abrirNueva,
    abrirEdicion,
    cerrarForm,
    draft,
    setDraft,
    draftDesglose: desgloseDe(draft),
    saving,
    formError,
    guardarDraft,
    pedirCambioEstado,
    confirmAction,
    setConfirmAction,
  };
}

export type CargaComisionesState = ReturnType<typeof useCargaComisiones>;
