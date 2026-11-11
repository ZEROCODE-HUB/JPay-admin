import { useMemo, useState } from "react";
import { useMovimientos } from "@/hooks/useMovimientos";
import { finDeDia, rangoMesActual, resumirComisiones } from "../utils";

/** Rango de fechas, depósitos + retiros del periodo y su resumen de comisiones. */
export function useComisionesDashboard() {
  const [inicial] = useState(() => rangoMesActual(new Date()));
  const [desde, setDesde] = useState(inicial.desde);
  const [hasta, setHasta] = useState(inicial.hasta);
  const [showDesglose, setShowDesglose] = useState(false);

  const dep = useMovimientos({
    page: 0,
    pageSize: 1000,
    tipo: "deposito",
    fechaDesde: desde,
    fechaHasta: finDeDia(hasta),
    countMode: "exact",
  });
  const ret = useMovimientos({
    page: 0,
    pageSize: 1000,
    tipo: "retiro",
    fechaDesde: desde,
    fechaHasta: finDeDia(hasta),
    countMode: "exact",
  });

  const isLoading = dep.isLoading || ret.isLoading;
  // Si falla cualquiera de las dos consultas, el resumen estaría incompleto: se muestra el error.
  const error = (dep.isError && dep.error) || (ret.isError && ret.error) || null;
  const reintentar = () => void Promise.all([dep.refetch(), ret.refetch()]);
  const depRows = dep.rows;
  const retRows = ret.rows;

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
    error,
    reintentar,
    ...resumen,
  };
}
