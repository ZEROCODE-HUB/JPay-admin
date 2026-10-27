import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getMinMontoAdelanto,
  getResumenSaldosCalendario,
  listCalendarioAcreditaciones,
  type CalendarioAcreditacion,
  type EstadoCalendario,
  type ResumenSaldos,
} from "@/lib/api/calendario-acreditaciones";
import { useComercios } from "@/hooks/useComercios";
import { useRealtimeInvalidate } from "@/shared/realtime";
import { agruparPorFecha, diasDelMes, mesAnterior, mesSiguiente, nombreMes } from "../utils";

/** Estado de la pantalla: mes visible, filtros, datos y día seleccionado. */
export function useCalendario() {
  const today = new Date();
  const [mes, setMes] = useState(today.getMonth() + 1);
  const [anio, setAnio] = useState(today.getFullYear());
  const [comercioFilter, setComercioFilter] = useState("");
  const [banderaFilter, setBanderaFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<EstadoCalendario | "">("");
  const [selectedFecha, setSelectedFecha] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<CalendarioAcreditacion[]>([]);
  const [minMonto, setMinMonto] = useState<number>(100);

  const { rows: comerciosOptions } = useComercios({ page: 0, pageSize: 200 });

  // Traemos el monto mínimo de una sola vez al montar (configurable).
  useEffect(() => {
    let alive = true;
    getMinMontoAdelanto()
      .then((v) => {
        if (alive) setMinMonto(v);
      })
      .catch(() => {
        /* fallback ya es 100 */
      });
    return () => {
      alive = false;
    };
  }, []);

  // Resumen de saldos (cambia con el filtro de comercio)
  const { data: resumen, isLoading: loadingResumen } = useQuery<ResumenSaldos>({
    queryKey: ["calendario-resumen", comercioFilter || null],
    queryFn: () => getResumenSaldosCalendario(comercioFilter || null),
    staleTime: 30_000,
  });

  // Calendario del mes
  const { data: acreditaciones, isLoading } = useQuery<CalendarioAcreditacion[]>({
    queryKey: ["calendario-acreditaciones", mes, anio, comercioFilter, banderaFilter, estadoFilter],
    queryFn: () =>
      listCalendarioAcreditaciones({
        mes,
        anio,
        comercioId: comercioFilter || undefined,
        bandera: banderaFilter || undefined,
        estado: estadoFilter || undefined,
      }),
    staleTime: 60_000,
  });

  useRealtimeInvalidate("realtime-calendario-acreditaciones", {
    lotes_acreditacion: [["calendario-acreditaciones"], ["calendario-resumen"]],
    adelantos: [
      ["calendario-acreditaciones"],
      ["calendario-resumen"],
      ["calendario-adelantos-dia"],
    ],
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dias = useMemo(() => diasDelMes(mes, anio, today), [mes, anio]);

  const acreditacionesPorFecha = useMemo(
    () => agruparPorFecha(acreditaciones ?? []),
    [acreditaciones],
  );

  const irA = (m: { mes: number; anio: number }) => {
    setMes(m.mes);
    setAnio(m.anio);
  };

  const handleDiaClick = (fechaKey: string) => {
    const items = acreditacionesPorFecha.get(fechaKey) ?? [];
    if (items.length > 0) {
      setSelectedFecha(fechaKey);
      setSelectedItems(items);
    }
  };

  return {
    nombreMes: nombreMes(mes, anio),
    mesAnterior: () => irA(mesAnterior({ mes, anio })),
    mesSiguiente: () => irA(mesSiguiente({ mes, anio })),
    irAHoy: () => irA({ mes: today.getMonth() + 1, anio: today.getFullYear() }),
    comerciosOptions,
    comercioFilter,
    setComercioFilter,
    banderaFilter,
    setBanderaFilter,
    estadoFilter,
    setEstadoFilter,
    limpiarFiltros: () => {
      setComercioFilter("");
      setBanderaFilter("");
      setEstadoFilter("");
    },
    resumen,
    loadingResumen,
    isLoading,
    dias,
    acreditacionesPorFecha,
    minMonto,
    selectedFecha,
    selectedItems,
    handleDiaClick,
    cerrarDia: () => {
      setSelectedFecha(null);
      setSelectedItems([]);
    },
  };
}

export type CalendarioState = ReturnType<typeof useCalendario>;
