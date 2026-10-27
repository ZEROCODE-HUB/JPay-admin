import { useQuery } from "@tanstack/react-query";
import { listBanderas, type Bandera } from "@/lib/api/banderas";

/** Catálogo de banderas activas (misma query que usa la pantalla de lotes). */
export function useBanderasCatalogo() {
  return useQuery<Bandera[]>({
    queryKey: ["banderas", "Activo"],
    queryFn: () => listBanderas("Activo"),
    staleTime: 5 * 60_000,
    retry: false,
  });
}
