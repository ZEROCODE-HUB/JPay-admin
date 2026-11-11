import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMovimientos } from "@/hooks/useMovimientos";
import { getResumenCliente } from "@/lib/api/totales";

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

  // KPIs del período calculados por la base (saldo por moneda, total y movimientos por tipo):
  // antes se contaban sobre los primeros 1000 movimientos.
  const movimientosStatsQuery = useQuery({
    queryKey: ["resumen-cliente", legajo, movDesde, movHasta],
    queryFn: () => getResumenCliente(legajo, movFechaDesdeISO, movFechaHastaISO),
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
