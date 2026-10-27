import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listLotes, resumenLotes } from "@/lib/api/lotes";
import { listBanderas } from "@/lib/api/banderas";
import { useComercios } from "@/hooks/useComercios";
import { resumirPorComercio } from "../utils";
import type { LotesFiltrosState } from "./useLotesFiltros";

/** Datos de la pantalla: lotes paginados, KPIs, banderas, comercios y resumen por comercio. */
export function useLotesData(f: LotesFiltrosState) {
  const { rows: comerciosOptions } = useComercios({ page: 0, pageSize: 100 });

  // Banderas dinámicas desde el catálogo (no hardcodeadas). Si la
  // tabla no existe / falla, se cae al set de fallback.
  const { data: banderasCatalogo } = useQuery({
    queryKey: ["banderas", "Activo"],
    queryFn: () => listBanderas("Activo"),
    staleTime: 5 * 60_000,
    retry: false,
  });
  const opcionesBandera = (banderasCatalogo ?? []).map((b) => b.nombre);

  const filtros = { page: f.page, pageSize: f.pageSize, ...f.filtrosApi };
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["lotes", filtros],
    queryFn: () => listLotes(filtros),
  });

  const lotes = useMemo(() => data?.rows ?? [], [data]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / f.pageSize));

  // KPIs. Se invalidan junto con ["lotes", ...] al hacer cualquier
  // mutación, así que las cards se refrescan solas.
  const resumenQuery = useQuery({
    queryKey: ["lotes-resumen", f.fechaDesde, f.fechaHasta],
    queryFn: () =>
      resumenLotes({
        fechaDesde: f.fechaDesde || undefined,
        fechaHasta: f.fechaHasta || undefined,
      }),
  });

  // Resumen: agregación client-side sobre la página actual. Si se
  // necesita global, cambiar a fetch separado.
  const resumenData = useMemo(() => resumirPorComercio(lotes), [lotes]);

  return {
    comerciosOptions,
    opcionesBandera,
    lotes,
    total,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    resumen: resumenQuery.data,
    resumenData,
  };
}

export type LotesData = ReturnType<typeof useLotesData>;
