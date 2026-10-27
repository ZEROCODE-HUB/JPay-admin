import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { exportLotesVenta, listLotesVenta } from "@/lib/api/lotes-venta";
import { listBanderas } from "@/lib/api/banderas";
import { useComercios } from "@/hooks/useComercios";
import type { LoteVenta } from "@/lib/api/types";
import { lotesVentaACsv } from "../utils";

/** Estado de la pantalla "Lotes de Venta": filtros, paginación, datos, detalle y export. */
export function useLotesVenta() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [banderaFilter, setBanderaFilter] = useState("");
  const [comercioFilter, setComercioFilter] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [detalle, setDetalle] = useState<LoteVenta | null>(null);
  const [exportando, setExportando] = useState(false);

  const { rows: comerciosOptions } = useComercios({ page: 0, pageSize: 100 });
  const { data: banderas = [] } = useQuery({
    queryKey: ["banderas", "activas"],
    queryFn: () => listBanderas("Activo"),
    staleTime: 5 * 60_000,
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [
      "lotes-venta",
      page,
      pageSize,
      search,
      banderaFilter,
      comercioFilter,
      fechaDesde,
      fechaHasta,
    ],
    queryFn: () =>
      listLotesVenta({
        page,
        pageSize,
        search: search || undefined,
        bandera: banderaFilter || undefined,
        comercioId: comercioFilter || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      }),
  });

  const lotes = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filtrosExport = {
    search: search || undefined,
    bandera: banderaFilter || undefined,
    comercioId: comercioFilter || undefined,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
  };

  const exportar = async () => {
    setExportando(true);
    try {
      const rows = await exportLotesVenta(filtrosExport);
      const csv = lotesVentaACsv(rows);
      // BOM para que Excel interprete UTF-8 correctamente.
      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lotes-venta-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("[lotes-venta] export error:", e);
    } finally {
      setExportando(false);
    }
  };

  /** Envuelve un setter de filtro para que vuelva a la página 0. */
  const conReset = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPage(0);
  };

  return {
    page,
    setPage,
    pageSize,
    cambiarPageSize: (s: number) => {
      setPageSize(s);
      setPage(0);
    },
    search,
    setSearch: conReset(setSearch),
    banderaFilter,
    setBanderaFilter: conReset(setBanderaFilter),
    comercioFilter,
    setComercioFilter: conReset(setComercioFilter),
    fechaDesde,
    setFechaDesde: conReset(setFechaDesde),
    fechaHasta,
    setFechaHasta: conReset(setFechaHasta),
    detalle,
    setDetalle,
    exportando,
    exportar,
    banderas,
    comerciosOptions,
    lotes,
    total,
    totalPages,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    isFetching,
  };
}

export type LotesVentaState = ReturnType<typeof useLotesVenta>;
