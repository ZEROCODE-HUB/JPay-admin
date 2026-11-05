import { useMemo, useState } from "react";
import type { TableServerFilters } from "@/shared/ui/data-table";
import { useMovimientos } from "@/hooks/useMovimientos";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useEstadosMovimiento, useEstadosPorTipo } from "@/hooks/useEstados";
import type { EstadoMovimiento } from "@/lib/api/types";
import { rangoFechaApi } from "../../comun/utils";
import { PAGE_SIZE, toFilaSubRuta, type FilaSubRuta } from "../utils";

/** Filtros, datos y estados válidos de una sub-ruta de movimientos. */
export function useMovimientosSubRuta({
  tipoCode,
  soloConImpuesto,
  soloConComision,
}: {
  tipoCode?: string;
  soloConImpuesto: boolean;
  soloConComision: boolean;
}) {
  const [page, setPage] = useState(0);

  // Filtros de la card del DataTable: van server-side contra toda la base.
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

  const filtros = useMemo(() => {
    return {
      page,
      pageSize: PAGE_SIZE,
      tipo: tipoCode,
      conImpuesto: soloConImpuesto || undefined,
      conComision: soloConComision || undefined,
      countMode: "estimated" as const,
      search: search || undefined,
      estadoCodigo: filtrosPanel.enums.estado || undefined,
      ...rangoFechaApi(filtrosPanel.dates.fecha),
    };
  }, [
    page,
    tipoCode,
    soloConImpuesto,
    soloConComision,
    search,
    filtrosPanel.enums,
    filtrosPanel.dates,
  ]);

  const query = useMovimientos(filtros);
  const { rows } = query;

  const { data: catalogoEstados = [] } = useEstadosMovimiento();
  const { data: estadosDelTipoIds = [] } = useEstadosPorTipo(tipoCode);

  // Estados válidos para el tipo fijo (join client-side estados_por_tipo × catálogo).
  const estadosValidos: EstadoMovimiento[] = useMemo(() => {
    if (!tipoCode) return [];
    const ids = new Set(estadosDelTipoIds.map((p) => p.estadoId));
    return catalogoEstados.filter((e) => ids.has(e.id));
  }, [tipoCode, catalogoEstados, estadosDelTipoIds]);

  // Destinos del modal de cambio de estado: con tipo fijo solo estados válidos
  // del tipo; vista transversal (todos los tipos): catálogo completo (la RPC
  // valida igual contra estados_por_tipo server-side).
  const destinosEstado = tipoCode ? estadosValidos : catalogoEstados;

  const byTxn = new Map(rows.map((r) => [r.idTxn, r]));
  const data: FilaSubRuta[] = rows.map((m) => toFilaSubRuta(m, catalogoEstados));

  return {
    query,
    page,
    setPage,
    filtrosPanel,
    aplicarFiltros,
    data,
    byTxn,
    catalogoEstados,
    destinosEstado,
  };
}
