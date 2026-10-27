import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { TableServerFilters } from "@/shared/ui/data-table";
import { useClientes } from "@/hooks/useClientes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getClientesEnrichment, type ClienteEnrichment } from "@/lib/api/clientes";
import type { EstadoCliente } from "@/lib/api/types";
import { LABEL_A_ESTADO } from "@/lib/cliente-estados";

/**
 * Paginación, filtros (estado + búsqueda server-side), listado de clientes y
 * enrichment por legajo. Compartido por Personas físicas y Personas jurídicas.
 */
export function useClientesListado({
  tipoPersona,
  enrichmentKey,
}: {
  tipoPersona: "fisica" | "juridica";
  enrichmentKey: string;
}) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filtroEstado, setFiltroEstado] = useState<string>("");

  // Buscar de la card: server-side contra toda la base (no solo la página).
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

  const estadoFiltroDb = filtroEstado
    ? (LABEL_A_ESTADO[filtroEstado] as EstadoCliente | undefined)
    : undefined;

  const listado = useClientes({
    page,
    pageSize,
    estado: estadoFiltroDb,
    tipoPersona,
    search: search || undefined,
  });
  const { rows } = listado;

  // Enrichment paralelo por legajo. Se cachea por legajos (no por filtros), así
  // no se dispara en cada cambio de paginación. Se invalida junto con la lista
  // de clientes via queryClient.
  const enrichmentQuery = useQuery<Record<string, ClienteEnrichment>>({
    queryKey: [enrichmentKey, rows.map((r) => r.legajo).join("|")],
    queryFn: async () => getClientesEnrichment(rows.map((r) => r.legajo)),
    enabled: rows.length > 0,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
  const enrichmentMap = enrichmentQuery.data ?? {};

  const cambiarFiltroEstado = (valor: string) => {
    setFiltroEstado(valor);
    setPage(0);
  };
  const cambiarPageSize = (s: number) => {
    setPageSize(s);
    setPage(0);
  };

  return {
    ...listado,
    page,
    setPage,
    pageSize,
    cambiarPageSize,
    filtroEstado,
    cambiarFiltroEstado,
    filtrosPanel,
    aplicarFiltros,
    enrichmentMap,
  };
}

export type ClientesListado = ReturnType<typeof useClientesListado>;
