import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCan } from "@/lib/permissions";
import { exportLotesAcreditacion, updateLote } from "@/lib/api/lotes";
import type { LoteAcreditacion } from "@/lib/api/types";
import { descargarTexto, nombreExportLotes } from "../descargas";
import {
  lotesACsv,
  mensajeCsvCargado,
  parseContracargoInput,
  type ResumenComercio,
} from "../utils";
import type { LotesFiltrosState } from "./useLotesFiltros";

export type ContracargoDraft = {
  lote: LoteAcreditacion;
  notas: string;
  contracargoMonto: string;
};

/** Modales abiertos y acciones (subir CSV, acreditar, contracargo, exportar). */
export function useLotesAcciones(f: LotesFiltrosState) {
  const queryClient = useQueryClient();
  const { can } = useCan();
  const puedeGestionar = can("modificar", "comercios");

  const [tab, setTab] = useState<"lotes" | "resumen">("lotes");
  const [detail, setDetail] = useState<LoteAcreditacion | null>(null);
  const [comercioDetail, setComercioDetail] = useState<ResumenComercio | null>(null);
  const [contracargoModal, setContracargoModal] = useState<ContracargoDraft | null>(null);
  // Cargar CSV: null = cerrado. Si trae `lote`, modo per-lote; si no, modo general.
  const [cargarCsv, setCargarCsv] = useState<{ lote: LoteAcreditacion | null } | null>(null);
  const [confirmarAcreditacion, setConfirmarAcreditacion] = useState<LoteAcreditacion | null>(null);
  const [exportando, setExportando] = useState(false);

  const invalidarLotes = () => {
    queryClient.invalidateQueries({ queryKey: ["lotes"] });
    queryClient.invalidateQueries({ queryKey: ["lotes-resumen"] });
    queryClient.invalidateQueries({ queryKey: ["lotes-detalle"] });
  };

  const onSubirCsv = (lote: LoteAcreditacion) => {
    if (!puedeGestionar) return;
    setDetail(null);
    setCargarCsv({ lote });
  };

  const onAcreditar = (lote: LoteAcreditacion) => {
    if (!puedeGestionar) return;
    setDetail(null);
    setConfirmarAcreditacion(lote);
  };

  const abrirContracargo = (lote: LoteAcreditacion) =>
    setContracargoModal({
      lote,
      notas: "",
      contracargoMonto: String(lote.contracargoMonto ?? ""),
    });

  const handleCsvCargado = (r: { aplicados: number; sinMatch: number }) => {
    const { tipo, texto } = mensajeCsvCargado(r);
    if (tipo === "success") toast.success(texto);
    else toast.warning(texto);
    invalidarLotes();
    setCargarCsv(null);
  };

  const handleAcreditado = () => {
    toast.success(`Lote ${confirmarAcreditacion?.codigo ?? ""} acreditado`);
    invalidarLotes();
    setConfirmarAcreditacion(null);
  };

  const handleContracargo = async () => {
    if (!contracargoModal) return;
    const { lote, notas, contracargoMonto } = contracargoModal;
    try {
      await updateLote(lote.id, {
        estado: "Acreditado",
        contracargoMonto: parseContracargoInput(contracargoMonto),
        notasResolucion: notas || null,
      });
      toast.success(`Lote ${lote.codigo} acreditado${notas ? ` — ${notas}` : ""}`);
      invalidarLotes();
      setContracargoModal(null);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const exportarCsv = async () => {
    if (exportando) return;
    setExportando(true);
    try {
      const rows = await exportLotesAcreditacion(f.filtrosApi);
      if (rows.length === 0) {
        toast.warning("No hay lotes para exportar con esos filtros.");
        return;
      }
      descargarTexto(lotesACsv(rows), nombreExportLotes(), "text/csv;charset=utf-8");
      toast.success(`${rows.length} lotes exportados.`);
    } catch (e) {
      toast.error(`Error al exportar: ${(e as Error).message}`);
    } finally {
      setExportando(false);
    }
  };

  return {
    puedeGestionar,
    tab,
    setTab,
    detail,
    setDetail,
    comercioDetail,
    setComercioDetail,
    contracargoModal,
    setContracargoModal,
    cargarCsv,
    setCargarCsv,
    confirmarAcreditacion,
    setConfirmarAcreditacion,
    exportando,
    onSubirCsv,
    onAcreditar,
    abrirContracargo,
    handleCsvCargado,
    handleAcreditado,
    handleContracargo,
    exportarCsv,
  };
}

export type LotesAcciones = ReturnType<typeof useLotesAcciones>;
