import { useState } from "react";
import type { TableServerFilters } from "@/shared/ui/data-table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/** Paginación + panel de filtros server-side de un listado (alertas, bloqueos). */
export function useListadoServidor() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [panel, setPanel] = useState<TableServerFilters>({ global: "", enums: {}, dates: {} });
  const search = useDebouncedValue(panel.global.trim(), 350);

  const cambiarFiltros = (f: TableServerFilters) => {
    setPage(0);
    setPanel(f);
  };

  const cambiarPageSize = (s: number) => {
    setPageSize(s);
    setPage(0);
  };

  return { page, setPage, pageSize, cambiarPageSize, panel, cambiarFiltros, search };
}

export type ListadoServidor = ReturnType<typeof useListadoServidor>;
