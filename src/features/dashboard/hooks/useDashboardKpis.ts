import { useQuery } from "@tanstack/react-query";
import { getDashboardKpis } from "@/lib/api/dashboard";

/** Indicadores del inicio; se refrescan cada minuto. */
export function useDashboardKpis() {
  return useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: getDashboardKpis,
    refetchInterval: 60_000,
  });
}
