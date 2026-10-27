import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  estadoUiToDb,
  listContracargos,
  type Contra,
  type EstadoContra,
} from "@/lib/api/contracargos";
import { useCan } from "@/lib/permissions";
import { useRealtimeInvalidate } from "@/shared/realtime";
import { contarPorEstado } from "../utils";

/** Estado de la pantalla: filtro, listado, KPIs y modales abiertos. */
export function useContracargos() {
  const [detail, setDetail] = useState<Contra | null>(null);
  const [showCrear, setShowCrear] = useState(false);
  const [showImportar, setShowImportar] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState<EstadoContra | "">("");
  const { can } = useCan();
  const puedeGestionar = can("modificar", "comercios");

  const filterEstado = useMemo<EstadoContra | undefined>(() => {
    if (!estadoFilter) return undefined;
    return estadoFilter;
  }, [estadoFilter]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["contracargos", filterEstado ? estadoUiToDb(filterEstado) : undefined],
    queryFn: () => listContracargos(filterEstado ? { estado: filterEstado } : undefined),
  });

  useRealtimeInvalidate("realtime-contracargos-admin", {
    contracargos: [["contracargos"], ["lotes"]],
  });

  // KPIs: usar la lista completa que ya cargamos
  const kpis = contarPorEstado(rows);

  return {
    rows,
    isLoading,
    kpis,
    puedeGestionar,
    estadoFilter,
    setEstadoFilter,
    detail,
    setDetail,
    showCrear,
    setShowCrear,
    showImportar,
    setShowImportar,
  };
}
