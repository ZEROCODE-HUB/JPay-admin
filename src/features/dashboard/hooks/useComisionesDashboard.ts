import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getComisionesDashboard } from "@/lib/api/totales";
import { rangoMesActual, resumenDesdeBase } from "../utils";

/**
 * Rango de fechas y resumen de comisiones del período, calculado por la base: depósitos, envíos y
 * conversiones contabilizados, por moneda (antes: 1000 filas por tipo y todos los estados).
 */
export function useComisionesDashboard() {
  const [inicial] = useState(() => rangoMesActual(new Date()));
  const [desde, setDesde] = useState(inicial.desde);
  const [hasta, setHasta] = useState(inicial.hasta);
  const [showDesglose, setShowDesglose] = useState(false);

  const q = useQuery({
    queryKey: ["comisiones-dashboard", desde, hasta],
    queryFn: () => getComisionesDashboard(desde, hasta),
    enabled: !!desde && !!hasta && hasta >= desde,
    meta: { silencioso: true },
  });

  const resumen = useMemo(() => resumenDesdeBase(q.data?.MXN), [q.data]);
  const usd = q.data?.USD;

  return {
    desde,
    setDesde,
    hasta,
    setHasta,
    showDesglose,
    setShowDesglose,
    isLoading: q.isLoading,
    error: q.isError && !q.data ? q.error : null,
    reintentar: () => void q.refetch(),
    usd,
    ...resumen,
  };
}
