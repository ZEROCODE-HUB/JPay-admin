import { useQuery } from "@tanstack/react-query";
import { getDashboardDetalle } from "@/lib/api/dashboard";

/** Volumen, estado del sistema, registros, alertas y cobros del mes; se refresca cada minuto. */
export function useDashboardDetalle() {
  return useQuery({
    queryKey: ["dashboard", "detalle"],
    queryFn: getDashboardDetalle,
    refetchInterval: 60_000,
  });
}
