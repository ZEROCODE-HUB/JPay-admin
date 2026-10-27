import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRealtimeInvalidate } from "@/shared/realtime";
import type { TableServerFilters } from "@/shared/ui/data-table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { listEnlaces } from "@/lib/api/enlaces-pago";

/** Paginación, filtros server-side y listado (con realtime) de enlaces de pago. */
export function useEnlacesListado() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filtros de la card: server-side contra toda la base.
  const [filtrosPanel, setFiltrosPanel] = useState<TableServerFilters>({
    global: "",
    enums: {},
    dates: {},
  });
  const search = useDebouncedValue(filtrosPanel.global.trim(), 350);
  const estadoFiltro = (filtrosPanel.enums["estado"] as string | undefined) ?? "";
  const aplicarFiltros = (f: TableServerFilters) => {
    setPage(0);
    setFiltrosPanel(f);
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["enlaces-pago", page, pageSize, search, estadoFiltro],
    queryFn: () =>
      listEnlaces({
        page,
        pageSize,
        search: search || undefined,
        estado: estadoFiltro || undefined,
      }),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  useRealtimeInvalidate("realtime-enlaces-pago-admin", {
    cliente_links_pago: [["enlaces-pago"]],
  });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    page,
    setPage,
    pageSize,
    cambiarPageSize: (s: number) => {
      setPageSize(s);
      setPage(0);
    },
    filtrosPanel,
    aplicarFiltros,
    rows,
    total,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  };
}
