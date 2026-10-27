import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { TableServerFilters } from "@/shared/ui/data-table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { listAllCvus, type CvuRow } from "@/lib/api/subcuentas";

/** Paginación, filtros server-side (estado, búsqueda, fecha) y listado de CVUs. */
export function useCvuListado() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [estadoFilter, setEstadoFilter] = useState<string>("");

  // Buscar y fecha de la card: server-side contra toda la base.
  const [filtrosPanel, setFiltrosPanel] = useState<TableServerFilters>({
    global: "",
    enums: {},
    dates: {},
  });
  const search = useDebouncedValue(filtrosPanel.global.trim(), 350);
  const rangoFecha = Object.values(filtrosPanel.dates)[0];
  const aplicarFiltros = (f: TableServerFilters) => {
    setPage(0);
    setFiltrosPanel(f);
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["cvus", page, pageSize, estadoFilter, search, rangoFecha?.from, rangoFecha?.to],
    queryFn: () =>
      listAllCvus({
        page,
        pageSize,
        estado: (estadoFilter as never) || undefined,
        search: search || undefined,
        fechaDesde: rangoFecha?.from || undefined,
        fechaHasta: rangoFecha?.to || undefined,
      }),
  });

  const rows = (data?.rows ?? []) as CvuRow[];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const cambiarEstado = (valor: string) => {
    setEstadoFilter(valor);
    setPage(0);
  };
  const cambiarPageSize = (s: number) => {
    setPageSize(s);
    setPage(0);
  };

  return {
    rows,
    total,
    totalPages,
    page,
    setPage,
    pageSize,
    cambiarPageSize,
    estadoFilter,
    cambiarEstado,
    filtrosPanel,
    aplicarFiltros,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  };
}

export type CvuListado = ReturnType<typeof useCvuListado>;
