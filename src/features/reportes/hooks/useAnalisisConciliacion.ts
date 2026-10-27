import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { descargarArchivoConciliacion } from "@/lib/api/conciliaciones";
import { listMovimientos } from "@/lib/api/movimientos";
import type { Movimiento } from "@/lib/api/types";
import { parseBancoFile } from "@/lib/conciliacion/parse";
import { cruzarConciliacion, type AnalisisResumen } from "@/lib/conciliacion/engine";
import {
  calcularRangoConciliacion,
  downloadRowsToBankRows,
  type Archivo,
} from "@/features/reportes/utils/conciliacion";

/** Cruza un archivo bancario con los movimientos de plataforma de su rango. */
export function useAnalisisConciliacion(archivo: Archivo, allArchivos: Archivo[]) {
  const [resumen, setResumen] = useState<AnalisisResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangoLabel, setRangoLabel] = useState<string>("");
  const [movCount, setMovCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        let bankRows = archivo.bankRows ?? null;
        // Si no hay bankRows en memoria, intentar obtener del storage o del downloadRows mock
        if (!bankRows || bankRows.length === 0) {
          if (archivo.rawFile) {
            bankRows = await parseBancoFile(archivo.rawFile);
          } else if (archivo.storagePath && isSupabaseConfigured) {
            const file = await descargarArchivoConciliacion(archivo.storagePath, archivo.archivo);
            bankRows = await parseBancoFile(file);
          } else if (archivo.downloadRows.length > 0) {
            // fallback mock -> convertir downloadRows a BankRow shape mínimo
            bankRows = downloadRowsToBankRows(archivo.downloadRows);
          } else {
            throw new Error("No hay datos del archivo para analizar. Volvé a cargar el archivo.");
          }
        }
        // Rango incremental: 1er reporte = todo hasta fecha carga, siguientes = (fecha último reporte, fecha actual]
        let movimientos: Movimiento[] = [];
        let movCountDebug = 0;
        if (isSupabaseConfigured) {
          const { desde, hasta, rangoLabel } = calcularRangoConciliacion(archivo, allArchivos);
          try {
            // Paginado para histórico grande (>5000)
            const all: Movimiento[] = [];
            let page = 0;
            const pageSize = 5000;
            while (true) {
              const resPage = await listMovimientos({
                page,
                pageSize,
                fechaDesde: desde,
                fechaHasta: hasta,
              });
              all.push(...resPage.rows);
              movCountDebug = resPage.total ?? all.length;
              if (resPage.rows.length < pageSize) break;
              page++;
              if (page > 20) break; // safety cap 100k
            }
            movimientos = all;
          } catch {
            movimientos = [];
          }
          if (!cancelled) {
            setRangoLabel(rangoLabel);
            setMovCount(movCountDebug);
          }
        }
        const res = cruzarConciliacion(bankRows, movimientos);
        if (!cancelled) setResumen(res);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [archivo, allArchivos]);

  return { resumen, loading, error, rangoLabel, movCount };
}
