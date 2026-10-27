import { useMemo, useState } from "react";
import { useMovimientos } from "@/hooks/useMovimientos";
import { finDeDia, rangoMesActual, resumirComisiones } from "../utils";

/** Rango de fechas, depósitos + retiros del periodo y su resumen de comisiones. */
export function useComisionesDashboard() {
  const [inicial] = useState(() => rangoMesActual(new Date()));
  const [desde, setDesde] = useState(inicial.desde);
  const [hasta, setHasta] = useState(inicial.hasta);
  const [showDesglose, setShowDesglose] = useState(false);

  const { rows: depRows, isLoading: depLoading } = useMovimientos({
    page: 0,
    pageSize: 1000,
    tipo: "deposito",
    fechaDesde: desde,
    fechaHasta: finDeDia(hasta),
    countMode: "exact",
  });
  const { rows: retRows, isLoading: retLoading } = useMovimientos({
    page: 0,
    pageSize: 1000,
    tipo: "retiro",
    fechaDesde: desde,
    fechaHasta: finDeDia(hasta),
    countMode: "exact",
  });

  const isLoading = depLoading || retLoading;

  const resumen = useMemo(
    () => resumirComisiones([...(depRows ?? []), ...(retRows ?? [])]),
    [depRows, retRows],
  );

  return {
    desde,
    setDesde,
    hasta,
    setHasta,
    showDesglose,
    setShowDesglose,
    isLoading,
    ...resumen,
  };
}
