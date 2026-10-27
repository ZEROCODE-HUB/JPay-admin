import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  getAdelanto,
  getComerciosResumen,
  listAdelantos,
  listMontosAdelantos,
  obtenerPoolRecaudacion,
  type ComercioResumen,
  type PoolRecaudacion,
} from "@/lib/api/adelantos";
import type { EstadoAdelanto } from "@/lib/api/types";
import {
  searchSinAdelanto,
  toAdelantoUI,
  totalPaginas,
  totalesPorEstado,
  type AdelantoUI,
} from "../utils";

const RUTA = "/admin/comercios/link-pago/adelantos";

/** Estado de la pantalla: filtro, listado paginado, pool, deep link y modal abierto. */
export function useAdelantos() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [estadoFilter, setEstadoFilter] = useState<EstadoAdelanto | "">("");
  const [detail, setDetail] = useState<AdelantoUI | null>(null);

  // Deep link desde el calendario: ?comercio=<uuid>&adelanto=<uuid>
  // `comercio` filtra el listado (en el servidor) hasta que el operador
  // lo quite; `adelanto` abre el modal aunque no esté en la página actual.
  const search = useSearch({ from: RUTA });
  const comercioFromUrl = search?.comercio;
  const adelantoFromUrl = search?.adelanto;

  // Al cambiar el comercio de la URL se vuelve a la primera página.
  const [comercioPrevio, setComercioPrevio] = useState(comercioFromUrl);
  if (comercioPrevio !== comercioFromUrl) {
    setComercioPrevio(comercioFromUrl);
    setPage(0);
  }

  const comercioId = comercioFromUrl || undefined;
  const estado = estadoFilter || undefined;

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["adelantos", "pagina", page, pageSize, estado, comercioId],
    queryFn: () => listAdelantos({ comercioId, estado, page, pageSize }),
    placeholderData: keepPreviousData,
  });

  // KPIs por estado sobre el total (respeta el comercio, no la página).
  const { data: montos } = useQuery({
    queryKey: ["adelantos", "kpis", comercioId],
    queryFn: () => listMontosAdelantos({ comercioId }),
  });

  // Adelanto del enlace directo, leído por id.
  const { data: adelantoDeepLink, isSuccess: deepLinkCargado } = useQuery({
    queryKey: ["adelantos", "detalle", adelantoFromUrl],
    queryFn: () => getAdelanto(adelantoFromUrl as string),
    enabled: !!adelantoFromUrl,
  });

  // Pool de Recaudación: KPIs globales que se muestran SIEMPRE en la
  // cabecera de la pantalla. Refresca cada 30s.
  const { data: poolCabecera } = useQuery<PoolRecaudacion>({
    queryKey: ["pool-recaudacion", "cabecera"],
    queryFn: () => obtenerPoolRecaudacion(),
    refetchInterval: 30_000,
  });

  // La columna "Comercio" necesita nombre y legajo, no el UUID: un solo
  // query une los comercios de la página (y el del enlace directo).
  const adelantosCrudos = useMemo(() => data?.rows ?? [], [data]);
  const comerciosIds = useMemo(() => {
    const ids = new Set(adelantosCrudos.map((a) => a.comercioId));
    if (adelantoDeepLink) ids.add(adelantoDeepLink.comercioId);
    return Array.from(ids);
  }, [adelantosCrudos, adelantoDeepLink]);
  const { data: comerciosMap } = useQuery<Record<string, ComercioResumen>>({
    queryKey: ["adelantos-comercios", comerciosIds],
    queryFn: () => getComerciosResumen(comerciosIds),
    enabled: comerciosIds.length > 0,
    staleTime: 5 * 60_000,
  });

  const rows: AdelantoUI[] = adelantosCrudos.map((a) =>
    toAdelantoUI(a, comerciosMap?.[a.comercioId]),
  );

  // Enlace a un adelanto que no existe: avisamos y limpiamos la URL.
  useEffect(() => {
    if (adelantoFromUrl && deepLinkCargado && adelantoDeepLink === null) {
      toast.error("No se encontró el adelanto del enlace");
      void navigate({ to: RUTA, search: (prev) => searchSinAdelanto(prev), replace: true });
    }
  }, [adelantoFromUrl, deepLinkCargado, adelantoDeepLink, navigate]);

  // El modal del enlace directo se deriva de la URL: al cerrarlo se quita
  // `adelanto` de la URL (replace) y ya no se vuelve a abrir.
  const detailDeepLink =
    adelantoFromUrl && adelantoDeepLink
      ? toAdelantoUI(adelantoDeepLink, comerciosMap?.[adelantoDeepLink.comercioId])
      : null;

  const cerrarDetalle = () => {
    setDetail(null);
    if (adelantoFromUrl) {
      void navigate({ to: RUTA, search: (prev) => searchSinAdelanto(prev), replace: true });
    }
  };

  const limpiarFiltroComercio = () => {
    void navigate({ to: RUTA, search: {} });
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

  const totales = useMemo(() => totalesPorEstado(montos?.rows ?? []), [montos]);
  const total = data?.total ?? 0;

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
    rowsVisibles: rows,
    page,
    setPage,
    pageSize,
    setPageSize: (n: number) => {
      setPageSize(n);
      setPage(0);
    },
    total,
    totalPages: totalPaginas(total, pageSize),
    isLoading,
    isFetching,
    isError,
    error: error as Error | null,
    refetch,
    detail: detail ?? detailDeepLink,
    setDetail,
    cerrarDetalle,
    onSave: () => {
      refetch();
      invalidarTodo();
    },
    onAcreditado: invalidarTodo,
  };
}
