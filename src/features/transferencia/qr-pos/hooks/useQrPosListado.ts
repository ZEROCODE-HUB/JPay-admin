import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRealtimeInvalidate } from "@/shared/realtime";
import { DataAccessError } from "@/lib/api/errors";
import { listQrPos } from "@/lib/api/qr-pos";
import type { EstadoQr } from "@/lib/api/types";
import { totalPaginas } from "../utils";

/** Filtros, paginación y datos del listado de QRs/POS. */
export function useQrPosListado() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<EstadoQr | "">("");

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["qr-pos", page, pageSize, search, estado],
    queryFn: () =>
      listQrPos({ page, pageSize, search: search || undefined, estado: estado || undefined }),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  useRealtimeInvalidate("realtime-puntos_venta-admin", {
    puntos_venta: [["qr-pos"]],
  });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const err = error instanceof DataAccessError ? error : null;

  return {
    page,
    setPage,
    pageSize,
    cambiarPageSize: (s: number) => {
      setPageSize(s);
      setPage(0);
    },
    search,
    cambiarSearch: (v: string) => {
      setSearch(v);
      setPage(0);
    },
    estado,
    cambiarEstado: (v: EstadoQr | "") => {
      setEstado(v);
      setPage(0);
    },
    rows,
    total,
    totalPages: totalPaginas(total, pageSize),
    isLoading,
    isError,
    isFetching,
    err,
    refetch,
  };
}
