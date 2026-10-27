import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { brand } from "@/brand/brand";
import { useComercios } from "@/hooks/useComercios";
import { listEstablecimientos, getParametroNumerico } from "@/lib/api/liquidaciones";
import { listLotes, aplicarLiquidacionLote } from "@/lib/api/lotes";
import { calcularRetencionesLote, type ResultadoRetenciones } from "@/lib/api/retenciones-lote";
import type { LoteAcreditacion } from "@/lib/api/types";
import {
  calcularAcreditacion,
  PARAMETROS_DEFAULT,
  type OverrideRenglon,
  type ParametrosAcreditacion,
  type PreviewAcreditacion,
} from "@/lib/liquidaciones/acreditacion";
import { calcularMatchGeneral } from "@/lib/liquidaciones/match-general";
import {
  parseArchivoLiquidacion,
  type RenglonLiquidacion,
  type ResultadoParseo,
} from "@/lib/liquidaciones/parse";
import {
  construirSitios,
  csvContracargosDemo,
  fechaCobroRealPara,
  iibbMontoFinal as calcularIibbFinal,
  liquidacionDePreview,
  mapearEstablecimientos,
  validarCarga,
  type PreviewGeneral,
  type ResultadoCargaCsv,
} from "../utils";

/** Trae todos los lotes en estado Programado, paginando de a 1000. */
async function listarTodosLosProgramados(): Promise<LoteAcreditacion[]> {
  const all: LoteAcreditacion[] = [];
  let page = 0;
  let total = Infinity;
  while (all.length < total) {
    const r = await listLotes({ page, pageSize: 1000, estado: "Programado" });
    all.push(...r.rows);
    total = r.total;
    page += 1;
    if (r.rows.length === 0) break;
  }
  return all;
}

/**
 * Estado del modal de carga de liquidación: archivo, parámetros, overrides,
 * preview (per-lote o general) y confirmación.
 */
export function useCargarCsv({
  open,
  lote,
  onClose,
  onCargado,
}: {
  open: boolean;
  lote?: LoteAcreditacion | null;
  onClose: () => void;
  onCargado: (resultado: ResultadoCargaCsv) => void;
}) {
  const modoPerLote = !!lote;
  const [file, setFile] = useState<File | null>(null);
  const [parseado, setParseado] = useState<ResultadoParseo | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parametros, setParametros] = useState<ParametrosAcreditacion>(PARAMETROS_DEFAULT);
  const [comercioManual, setComercioManual] = useState("");
  const [overrides, setOverrides] = useState<Record<number, OverrideRenglon>>({});
  const [verColumnas, setVerColumnas] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  // Lotes Programado en modo general. Se levantan vía una llamada dedicada
  // (no reutilizamos el hook de la página para no entrar en bucle con su estado).
  const [programados, setProgramados] = useState<LoteAcreditacion[] | null>(null);
  const [cargandoProgramados, setCargandoProgramados] = useState(false);
  useEffect(() => {
    if (!open || modoPerLote) return;
    let cancelled = false;
    setCargandoProgramados(true);
    (async () => {
      try {
        const all = await listarTodosLosProgramados();
        if (!cancelled) setProgramados(all);
      } catch (e) {
        if (!cancelled) setErrorGuardado((e as Error).message);
      } finally {
        if (!cancelled) setCargandoProgramados(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, modoPerLote]);

  // Los parámetros se leen una vez al abrir. El snapshot del lote gana sobre el
  // global solo si es > 0: el 0,45% de cierre se calcula al confirmar, así que un
  // lote Programado/Pendiente suele tener 0 y mostrarlo confunde al operador.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const cierreGlobal = await getParametroNumerico(
        "comision_cierre_lote_pct",
        PARAMETROS_DEFAULT.comisionCierreLotePct,
      );
      const tolerancia = await getParametroNumerico(
        "liquidacion_tolerancia_bruto_pct",
        PARAMETROS_DEFAULT.toleranciaBrutoPct,
      );
      if (cancelled) return;
      setParametros((p) => ({
        ...p,
        comisionCierreLotePct:
          (lote?.comisionCierreLotePct ?? 0) > 0
            ? (lote?.comisionCierreLotePct as number)
            : cierreGlobal,
        toleranciaBrutoPct: tolerancia,
      }));
    })();
    return () => {
      cancelled = true;
    };
  }, [open, lote]);

  // Parseo del CSV: se dispara al elegir un archivo; el nuevo reemplaza todo.
  useEffect(() => {
    if (!file) {
      setParseado(null);
      setParseError(null);
      return;
    }
    let cancelled = false;
    setParsing(true);
    setParseError(null);
    parseArchivoLiquidacion(file)
      .then((res) => {
        if (cancelled) return;
        setParseado(res);
        setOverrides({});
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setParseado(null);
        setParseError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setParsing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  const renglones: RenglonLiquidacion[] = useMemo(() => parseado?.renglones ?? [], [parseado]);

  // Mapa de establecimientos. Sin tablaDisponible el modal avisa y permite el
  // selector manual (solo per-lote).
  const estabQuery = useQuery({
    queryKey: ["liquidaciones", "establecimientos"],
    queryFn: listEstablecimientos,
    staleTime: 5 * 60_000,
    retry: false,
    enabled: open,
  });
  const tablaDisponible = estabQuery.data?.tablaDisponible ?? true;

  // Motor de retenciones automáticas (solo per-lote: el motor es por lote).
  const retencionesQuery = useQuery<ResultadoRetenciones | null>({
    queryKey: ["retenciones-lote", lote?.id],
    queryFn: () => (lote ? calcularRetencionesLote(lote.id) : Promise.resolve(null)),
    enabled: !!lote && open,
    staleTime: 30_000,
    retry: false,
  });
  const retenciones = retencionesQuery.data ?? null;

  const establecimientos = useMemo(
    () => mapearEstablecimientos(estabQuery.data?.rows ?? []),
    [estabQuery.data],
  );

  const sitios = useMemo(
    () => construirSitios(modoPerLote, lote, programados),
    [modoPerLote, lote, programados],
  );

  const comercios = useComercios({ page: 0, pageSize: 200 });

  // Per-lote: resolver completo con overrides y comercio manual.
  const previewPerLote: PreviewAcreditacion | null = useMemo(() => {
    if (!modoPerLote || !lote || renglones.length === 0) return null;
    return calcularAcreditacion({
      lote,
      renglones,
      establecimientos,
      parametros,
      comercioManual: comercioManual || null,
      overrides,
      sitios,
    });
  }, [
    modoPerLote,
    lote,
    renglones,
    establecimientos,
    parametros,
    comercioManual,
    overrides,
    sitios,
  ]);

  // General: match contra todos los Programado y, por cada uno, sus totales.
  const previewGeneral: PreviewGeneral | null = useMemo(() => {
    if (modoPerLote || !parseado || renglones.length === 0) return null;
    if (!programados || programados.length === 0) return null;
    const match = calcularMatchGeneral({ renglones, lotes: programados, establecimientos, sitios });
    const matches = match.conMatch.map((m) => ({
      ...m,
      preview: calcularAcreditacion({
        lote: m.lote,
        renglones: m.renglones,
        establecimientos,
        parametros,
        comercioManual: null,
        overrides: {},
        sitios,
      }),
    }));
    return { matches, sinMatch: match.sinMatch };
  }, [modoPerLote, parseado, renglones, programados, establecimientos, parametros, sitios]);

  const setOverride = (nro: number, ov: OverrideRenglon | null) =>
    setOverrides((prev) => {
      const next = { ...prev };
      if (ov === null) delete next[nro];
      else next[nro] = ov;
      return next;
    });

  const setParam = <K extends keyof ParametrosAcreditacion>(k: K, v: ParametrosAcreditacion[K]) =>
    setParametros((p) => ({ ...p, [k]: v }));

  const descargarCsvContracargoDemo = () => {
    const { nombre, contenido } = csvContracargosDemo(new Date(), brand.name);
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("CSV de contracargos demo descargado");
  };

  const cerrar = useCallback(() => {
    setFile(null);
    setParseado(null);
    setParseError(null);
    setComercioManual("");
    setOverrides({});
    setVerColumnas(false);
    setErrorGuardado(null);
    setGuardando(false);
    setProgramados(null);
    onClose();
  }, [onClose]);

  const iibbMontoFinal = useMemo(
    () => calcularIibbFinal(retenciones, parametros.retencionIibbMonto),
    [retenciones, parametros.retencionIibbMonto],
  );

  const aplicar = async () => {
    const v = validarCarga({ modoPerLote, lote, previewPerLote, previewGeneral });
    if (!v.ok) {
      setErrorGuardado(v.msg);
      return;
    }
    setGuardando(true);
    setErrorGuardado(null);
    try {
      let aplicados = 0;
      let sinMatch = 0;
      const cierrePct = parametros.comisionCierreLotePct;
      if (modoPerLote && lote && previewPerLote) {
        const liq = liquidacionDePreview(
          previewPerLote,
          lote.tasaPropiaPct,
          cierrePct,
          retenciones,
          iibbMontoFinal,
        );
        const fechaCobro = fechaCobroRealPara(previewPerLote.aplicables.map((m) => m.renglon));
        await aplicarLiquidacionLote(lote.id, liq, fechaCobro);
        aplicados = 1;
        sinMatch = previewPerLote.renglones.length - previewPerLote.aplicables.length;
      } else if (previewGeneral) {
        for (const m of previewGeneral.matches) {
          const liq = liquidacionDePreview(
            m.preview,
            m.lote.tasaPropiaPct,
            cierrePct,
            retenciones,
            iibbMontoFinal,
          );
          await aplicarLiquidacionLote(m.lote.id, liq, fechaCobroRealPara(m.renglones));
          aplicados += 1;
        }
        sinMatch = previewGeneral.sinMatch.length;
      }
      onCargado({ aplicados, sinMatch });
      cerrar();
    } catch (e) {
      setErrorGuardado(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  };

  return {
    modoPerLote,
    lote,
    setFile,
    parseado,
    parseError,
    parsing,
    parametros,
    setParam,
    comercioManual,
    setComercioManual,
    overrides,
    setOverride,
    verColumnas,
    setVerColumnas,
    guardando,
    errorGuardado,
    programados,
    cargandoProgramados,
    tablaDisponible,
    retenciones,
    comercios,
    previewPerLote,
    previewGeneral,
    iibbMontoFinal,
    sinCargaCsv: renglones.length === 0,
    descargarCsvContracargoDemo,
    cerrar,
    aplicar,
  };
}

export type CargarCsvState = ReturnType<typeof useCargarCsv>;
