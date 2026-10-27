import { useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { descargarCsv } from "@/lib/api/alert-rules";
import {
  ALERT_RESOLUTION_LABEL,
  acceptAlert,
  listAlerts,
  listAllAlerts,
  resolveAlert,
  runComplianceSweep,
  type AlertFilters,
  type AlertItem,
  type AlertResolution,
} from "@/lib/api/compliance";
import { useListadoServidor } from "../../comun/hooks/useListadoServidor";
import { nombreCsv } from "../../comun/utils";
import {
  CSV_CABECERA,
  filaCsvAlerta,
  filtrosAlertas,
  mensajeBarrido,
  type Dictamen,
} from "../utils";

/** Estado de la pantalla "Listado de alertas": filtros, query, diálogos y acciones. */
export function useAlertasListado() {
  const queryClient = useQueryClient();
  const listado = useListadoServidor();
  const { panel, search, page, pageSize } = listado;

  const filtros: AlertFilters = useMemo(
    () => filtrosAlertas(panel, search),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mismas dependencias que el original
    [search, panel.enums, panel.dates],
  );

  const lista = useQuery({
    queryKey: ["alerts", filtros, page, pageSize],
    queryFn: () => listAlerts({ ...filtros, page, pageSize }),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
  const rows = lista.data?.rows ?? [];
  const total = lista.data?.total ?? 0;

  const [detalle, setDetalle] = useState<AlertItem | null>(null);
  const [dictamen, setDictamen] = useState<Dictamen | null>(null);
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [barriendo, setBarriendo] = useState(false);
  const [simOpen, setSimOpen] = useState(false);

  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["alerts"] });

  const aceptar = async (a: AlertItem) => {
    try {
      await acceptAlert(a.id);
      toast.success("Alerta aceptada: queda en revisión");
      await refrescar();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const confirmarDictamen = async () => {
    if (!dictamen) return;
    if (notas.trim().length < 5) {
      toast.error("Escribí el dictamen (al menos 5 caracteres)");
      return;
    }
    setEnviando(true);
    try {
      await resolveAlert(dictamen.alert.id, dictamen.resolution, notas.trim());
      toast.success(`Alerta cerrada: ${ALERT_RESOLUTION_LABEL[dictamen.resolution]}`);
      setDictamen(null);
      setNotas("");
      setDetalle(null);
      await refrescar();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  const barrer = async () => {
    setBarriendo(true);
    try {
      const r = await runComplianceSweep();
      toast.success(mensajeBarrido(r));
      await refrescar();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBarriendo(false);
    }
  };

  const exportar = async () => {
    try {
      const todas = await listAllAlerts(filtros);
      descargarCsv(nombreCsv("alertas"), CSV_CABECERA, todas.map(filaCsvAlerta));
    } catch (e) {
      toast.error(`No se pudo exportar: ${(e as Error).message}`);
    }
  };

  const abrirDictamen = (alert: AlertItem, resolution: AlertResolution) => {
    setNotas("");
    setDictamen({ alert, resolution });
  };

  return {
    listado,
    lista,
    rows,
    total,
    detalle,
    setDetalle,
    dictamen,
    setDictamen,
    notas,
    setNotas,
    enviando,
    barriendo,
    simOpen,
    setSimOpen,
    refrescar,
    aceptar,
    confirmarDictamen,
    barrer,
    exportar,
    abrirDictamen,
  };
}

export type AlertasListado = ReturnType<typeof useAlertasListado>;
