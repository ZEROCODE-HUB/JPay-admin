import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { TableServerFilters } from "@/shared/ui/data-table";
import { useComisiones } from "@/hooks/useComisiones";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  contarOtrasComisionesHabilitadas,
  setComisionEstado,
  upsertComision,
} from "@/lib/api/comisiones";
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

export type Alcance = "" | "subcuenta" | "cuenta";

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
  const [clabeFiltro, setClabeFiltro] = useState("");
  const legajoQ = useDebouncedValue(legajoFiltro.trim(), 350);
  const clabeQ = useDebouncedValue(clabeFiltro.trim(), 350);

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
    clabe: clabeQ || undefined,
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
      // Solo puede haber UNA comisión Habilitada por subcuenta (o por cliente) y tipo:
      // antes de activar esta, se verifica que no haya otra activa del mismo alcance.
      if (nuevo === "Habilitado") {
        const cliente = await getClienteByCorreo(row.correo.toLowerCase());
        if (cliente) {
          const otras = await contarOtrasComisionesHabilitadas({
            clienteId: cliente.id,
            tipo: row.tipo,
            subcuentaId: row.subcuentaId,
            excluirId: row.id,
          });
          if (otras > 0) {
            const alcanceTxt = row.subcuentaId
              ? `la CLABE ${row.clabe ?? "de la subcuenta"}`
              : "toda la cuenta";
            errorDialogo(
              "Ya hay una comisión activa de ese tipo",
              `Ya hay una comisión de "${row.tipo}" habilitada para ${alcanceTxt}. Deshabilita esa antes de activar otra.`,
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
      setFormError("Selecciona el email del cliente (búsqueda rápida).");
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

      // Solo puede haber UNA comisión HABILITADA por alcance (subcuenta, o cliente si no
      // hay subcuenta) y tipo: se pueden guardar deshabilitadas, pero no dos activas del
      // mismo alcance a la vez.
      if (draft.estado === "Habilitado") {
        const otras = await contarOtrasComisionesHabilitadas({
          clienteId: cliente.id,
          tipo: draft.tipo,
          subcuentaId: draft.subcuentaId,
          excluirId: draft.id,
        });
        if (otras > 0) {
          const alcanceTxt = draft.subcuentaId
            ? `la subcuenta elegida`
            : `toda la cuenta de ${cliente.correo}`;
          setFormError(
            `Ya hay una comisión de "${draft.tipo}" activa para ${alcanceTxt}. Deshabilita esa, o guarda esta como "Deshabilitado".`,
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
    clabeFiltro,
    setClabeFiltro,
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
