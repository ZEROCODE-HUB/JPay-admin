import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  getComerciosResumen,
  listAdelantos,
  obtenerPoolRecaudacion,
  type ComercioResumen,
  type PoolRecaudacion,
} from "@/lib/api/adelantos";
import type { Adelanto, EstadoAdelanto } from "@/lib/api/types";
import { toAdelantoUI, totalesPorEstado, type AdelantoUI } from "../utils";

/** Estado de la pantalla: filtro, listado, pool, deep link y modal abierto. */
export function useAdelantos() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [estadoFilter, setEstadoFilter] = useState<EstadoAdelanto | "">("");
  const [detail, setDetail] = useState<AdelantoUI | null>(null);
  // Marker interno: id de adelanto a abrir cuando aparezca en la grilla.
  const [pendingDeepLinkAdelantoId, setPendingDeepLinkAdelantoId] = useState<string | null>(null);

  // Deep link desde el calendario: ?comercio=<uuid>&adelanto=<uuid>
  // Si viene `comercio`, lo usamos como filtro hasta que el operador
  // lo limpie con "Limpiar". Si viene `adelanto`, abrimos el modal
  // apenas la fila esté disponible en la página actual.
  const search = useSearch({ from: "/admin/comercios/link-pago/adelantos" });
  const comercioFromUrl = search?.comercio;
  const adelantoFromUrl = search?.adelanto;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["adelantos", page, pageSize, estadoFilter],
    queryFn: () =>
      listAdelantos({
        page,
        pageSize,
        estado: (estadoFilter as EstadoAdelanto) || undefined,
      }),
  });

  // Si la URL trae `adelanto=<uuid>`, marcamos la intención de abrir
  // el modal. Si la fila está en la página actual, el modal se abre
  // apenas se arme el `AdelantoUI` con su join a comercios.
  useEffect(() => {
    if (!adelantoFromUrl || detail) return;
    setPendingDeepLinkAdelantoId(adelantoFromUrl);
  }, [adelantoFromUrl, detail]);

  // Pool de Recaudación: KPIs globales que se muestran SIEMPRE en la
  // cabecera de la pantalla. Refresca cada 30s.
  const { data: poolCabecera } = useQuery<PoolRecaudacion>({
    queryKey: ["pool-recaudacion", "cabecera"],
    queryFn: () => obtenerPoolRecaudacion(),
    refetchInterval: 30_000,
  });

  // La columna "Comercio" necesita nombre y legajo, no el UUID: un solo
  // query une los comercios que aparecieron en la página actual.
  const adelantosCrudos: Adelanto[] = useMemo(() => data ?? [], [data]);
  const comerciosIds = useMemo(
    () => Array.from(new Set(adelantosCrudos.map((a) => a.comercioId))),
    [adelantosCrudos],
  );
  const { data: comerciosMap } = useQuery<Record<string, ComercioResumen>>({
    queryKey: ["adelantos-comercios", comerciosIds],
    queryFn: () => getComerciosResumen(comerciosIds),
    enabled: comerciosIds.length > 0,
    staleTime: 5 * 60_000,
  });

  const rows: AdelantoUI[] = adelantosCrudos.map((a) =>
    toAdelantoUI(a, comerciosMap?.[a.comercioId]),
  );

  // Deep link: si la fila del adelanto está en la página actual,
  // abrimos el modal automáticamente y limpiamos el marker.
  useEffect(() => {
    if (!pendingDeepLinkAdelantoId || detail) return;
    const target = rows.find((r) => r.fullId === pendingDeepLinkAdelantoId);
    if (target) {
      setDetail(target);
      setPendingDeepLinkAdelantoId(null);
    }
  }, [pendingDeepLinkAdelantoId, rows, detail]);

  // Si la URL trae `comercio`, filtramos la grilla en cliente.
  const rowsVisibles = useMemo(() => {
    if (!comercioFromUrl) return rows;
    return rows.filter((r) => r.comercioId === comercioFromUrl);
  }, [rows, comercioFromUrl]);

  const limpiarFiltroComercio = () => {
    void navigate({
      to: "/admin/comercios/link-pago/adelantos",
      search: {},
    } as never);
  };

  const invalidarTodo = () => {
    queryClient.invalidateQueries({ queryKey: ["adelantos"] });
    queryClient.invalidateQueries({ queryKey: ["lotes"] });
    queryClient.invalidateQueries({ queryKey: ["lotes-resumen"] });
    // Para que el portal de Enterprises vea el cambio al refrescar
    queryClient.invalidateQueries({ queryKey: ["subcuentas"] });
    // Pool de Recaudación: cambia cuando se Acredita un adelanto.
    queryClient.invalidateQueries({ queryKey: ["pool-recaudacion"] });
  };

  const totales = useMemo(() => totalesPorEstado(adelantosCrudos), [adelantosCrudos]);

  return {
    estadoFilter,
    cambiarEstado: (e: EstadoAdelanto | "") => {
      setEstadoFilter(e);
      setPage(0);
    },
    comercioFromUrl,
    limpiarFiltroComercio,
    poolCabecera,
    totales,
    rowsVisibles,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    detail,
    setDetail,
    onSave: () => {
      refetch();
      invalidarTodo();
    },
    onAcreditado: invalidarTodo,
  };
}
