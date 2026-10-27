import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMovimientos } from "@/hooks/useMovimientos";

/** Filtros por período, paginación y KPIs de la pestaña Movimientos. */
export function useMovimientosCliente(legajo: string) {
  const [movDesde, setMovDesde] = useState("");
  const [movHasta, setMovHasta] = useState("");
  const [movPage, setMovPage] = useState(0);

  const movFechaDesdeISO = movDesde ? new Date(movDesde + "T00:00:00").toISOString() : undefined;
  const movFechaHastaISO = movHasta ? new Date(movHasta + "T23:59:59").toISOString() : undefined;

  // Reset page when filters change
  useEffect(() => {
    setMovPage(0);
  }, [legajo, movDesde, movHasta]);

  const movimientosQuery = useMovimientos({
    page: movPage,
    pageSize: 10,
    legajo: legajo ?? undefined,
    fechaDesde: movFechaDesdeISO,
    fechaHasta: movFechaHastaISO,
  });

  // Stats para KPIs: fetch amplio (1000) con mismos filtros de período
  const movimientosStatsQuery = useQuery({
    queryKey: ["movimientos", "stats", legajo, movDesde, movHasta],
    queryFn: () =>
      import("@/lib/api/movimientos").then((m) =>
        m.listMovimientos({
          page: 0,
          pageSize: 1000,
          legajo: legajo ?? undefined,
          fechaDesde: movFechaDesdeISO,
          fechaHasta: movFechaHastaISO,
        }),
      ),
    enabled: !!legajo,
    staleTime: 15_000,
  });

  return {
    movDesde,
    setMovDesde,
    movHasta,
    setMovHasta,
    movPage,
    setMovPage,
    movimientosQuery,
    movimientosStatsQuery,
  };
}
