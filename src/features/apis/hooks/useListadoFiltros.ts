import { useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/** Página, búsqueda (con debounce) y filtro de estado de un listado paginado. */
export function useListadoFiltros<E extends string>() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [estadoFilter, setEstadoFilter] = useState<E | "">("");

  const cambiarBusqueda = (value: string) => {
    setSearchInput(value);
    setPage(0);
  };

  const cambiarEstadoFilter = (value: E | "") => {
    setEstadoFilter(value);
    setPage(0);
  };

  return {
    page,
    setPage,
    searchInput,
    search,
    estadoFilter,
    cambiarBusqueda,
    cambiarEstadoFilter,
  };
}
