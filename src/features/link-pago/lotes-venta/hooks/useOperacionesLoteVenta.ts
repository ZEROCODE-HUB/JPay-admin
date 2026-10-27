import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listOperacionesLote } from "@/lib/api/lotes-venta";
import type { LoteVenta } from "@/lib/api/types";

/** Operaciones paginadas (y buscables) de un lote de venta. */
export function useOperacionesLoteVenta(lote: LoteVenta) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["lote-venta-ops", lote.comercioId, lote.bandera, lote.fecha, page, pageSize, search],
    queryFn: () =>
      listOperacionesLote({
        comercioId: lote.comercioId,
        bandera: lote.bandera,
        fecha: lote.fecha,
        page,
        pageSize,
        search: search || undefined,
      }),
  });

  const ops = data?.rows ?? [];
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
    search,
    setSearch: (v: string) => {
      setSearch(v);
      setPage(0);
    },
    ops,
    total,
    totalPages,
    isLoading,
    isError,
    refetch,
  };
}
