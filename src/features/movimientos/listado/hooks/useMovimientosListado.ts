import { useMemo, useState } from "react";
import type { TableServerFilters } from "@/shared/ui/data-table";
import { useLineasMovimiento } from "@/hooks/useLineasMovimiento";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { rangoFechaApi } from "../../comun/utils";
import { agruparPorTxid, TIPO_LINEA_CODE, toggleEnSet, type Fila } from "../utils";

/**
 * Filtros, paginación y agrupación por TXID del listado de líneas del ledger.
 * Cambiar un filtro de texto o la operación vuelve a la página 0.
 */
export function useMovimientosListado({
  legajo,
  txidInicial,
}: {
  legajo?: string;
  txidInicial?: string;
}) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filtrosPanel, setFiltrosPanel] = useState<TableServerFilters>({
    global: "",
    enums: {},
    dates: {},
  });
  const [txid, setTxid] = useState(txidInicial ?? "");
  const [cuit, setCuit] = useState("");
  const [cvu, setCvu] = useState("");
  const [operacion, setOperacion] = useState("");
  const [agrupar, setAgrupar] = useState(true);
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set());

  const search = useDebouncedValue(filtrosPanel.global.trim(), 350);
  const txidQ = useDebouncedValue(txid.trim(), 350);
  const cuitQ = useDebouncedValue(cuit.trim(), 350);
  const cvuQ = useDebouncedValue(cvu.trim(), 350);

  const aplicarFiltros = (f: TableServerFilters) => {
    setPage(0);
    setFiltrosPanel(f);
  };

  const apiFilters = useMemo(() => {
    return {
      page,
      pageSize,
      legajo,
      search: search || undefined,
      txid: txidQ || undefined,
      cuit: cuitQ || undefined,
      cvu: cvuQ || undefined,
      tipoOperacion: operacion || undefined,
      tipoLinea: filtrosPanel.enums.tipoLinea
        ? TIPO_LINEA_CODE.get(filtrosPanel.enums.tipoLinea)
        : undefined,
      estadoCodigo: filtrosPanel.enums.estado || undefined,
      ...rangoFechaApi(filtrosPanel.dates.fecha),
    };
  }, [
    page,
    pageSize,
    legajo,
    search,
    txidQ,
    cuitQ,
    cvuQ,
    operacion,
    filtrosPanel.enums,
    filtrosPanel.dates,
  ]);

  const query = useLineasMovimiento(apiFilters);

  const data: Fila[] = useMemo(
    () => agruparPorTxid(query.rows, agrupar, abiertos),
    [query.rows, agrupar, abiertos],
  );

  const toggle = (idTxn: string) => setAbiertos((prev) => toggleEnSet(prev, idTxn));

  const filtrarTxid = (v: string) => {
    setTxid(v);
    setPage(0);
  };

  const conReset = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPage(0);
  };

  const cambiarPageSize = (s: number) => {
    setPageSize(s);
    setPage(0);
  };

  return {
    query,
    data,
    page,
    setPage,
    pageSize,
    setPageSize: cambiarPageSize,
    filtrosPanel,
    aplicarFiltros,
    txid,
    setTxid,
    filtrarTxid,
    cuit,
    setCuit: conReset(setCuit),
    cvu,
    setCvu: conReset(setCvu),
    operacion,
    setOperacion: conReset(setOperacion),
    agrupar,
    setAgrupar,
    abiertos,
    toggle,
  };
}
