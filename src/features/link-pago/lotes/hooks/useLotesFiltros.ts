import { useState } from "react";
import type { EstadoLote } from "@/lib/api/types";

/** Filtros y paginación de la grilla de lotes. Cambiar un filtro vuelve a la página 0. */
export function useLotesFiltros() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSizeState] = useState(10);
  const [search, setSearchState] = useState("");
  const [estado, setEstadoState] = useState<EstadoLote | "">("");
  const [bandera, setBanderaState] = useState("");
  const [comercioId, setComercioIdState] = useState("");
  const [fechaDesde, setFechaDesdeState] = useState("");
  const [fechaHasta, setFechaHastaState] = useState("");

  const conReset =
    <T>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(0);
    };

  /** Filtros sin paginación, con los vacíos como `undefined` (formato de lib/api). */
  const filtrosApi = {
    search: search || undefined,
    estado: estado || undefined,
    bandera: bandera || undefined,
    comercioId: comercioId || undefined,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
  };

  return {
    page,
    setPage,
    pageSize,
    setPageSize: conReset(setPageSizeState),
    search,
    setSearch: conReset(setSearchState),
    estado,
    setEstado: conReset(setEstadoState),
    bandera,
    setBandera: conReset(setBanderaState),
    comercioId,
    setComercioId: conReset(setComercioIdState),
    fechaDesde,
    setFechaDesde: conReset(setFechaDesdeState),
    fechaHasta,
    setFechaHasta: conReset(setFechaHastaState),
    filtrosApi,
  };
}

export type LotesFiltrosState = ReturnType<typeof useLotesFiltros>;
