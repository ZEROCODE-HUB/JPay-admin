import { useQuery } from "@tanstack/react-query";
import { useClienteByLegajo } from "@/hooks/useClientes";
import { useImpuestosAsignaciones } from "@/hooks/useImpuestos";
import { useEstadosMovimiento } from "@/hooks/useEstados";
import { listEvaluacionesRiesgo } from "@/lib/api/clientes";
import { listSubcuentas } from "@/lib/api/subcuentas";
import { listDocumentos } from "@/lib/api/documentos";
import { listComisiones } from "@/lib/api/comisiones";
import {
  listAlertas,
  listBloqueos,
  listClienteApiUsuarios,
  listClienteModulos,
  listComerciosPst,
  listComisionesCliente,
  listHistorialCambios,
  listLinksPago,
  listParametrosAlertas,
  listParametrosBloqueos,
  listValidaciones,
} from "@/lib/api/detalle-cliente";
import type { Cliente } from "@/lib/api/types";
import { useMovimientosCliente } from "./useMovimientosCliente";

/** Datos de la ficha de cliente: el cliente y todas las consultas de sus pestañas. */
export function useClienteDetalle(legajo: string) {
  const {
    cliente: clienteReal,
    isLoading,
    isError,
    error,
    refetch,
  } = useClienteByLegajo(legajo ?? null);
  const cliente: Cliente | null = clienteReal ?? null;

  const movimientos = useMovimientosCliente(legajo);

  const subcuentasQuery = useQuery({
    queryKey: ["subcuentas", legajo],
    queryFn: () => listSubcuentas(legajo),
    enabled: !!cliente,
  });
  const impuestosQuery = useImpuestosAsignaciones({
    page: 0,
    pageSize: 25,
    cliente_legajo: legajo ?? undefined,
  });
  const comisionesQuery = useQuery({
    queryKey: ["comisiones_cliente", legajo],
    queryFn: () => listComisionesCliente(legajo),
    enabled: !!cliente,
  });
  const comisionesRealesQuery = useQuery({
    queryKey: ["comisiones", "by-cliente", cliente?.id],
    queryFn: () => listComisiones({ page: 0, pageSize: 10, clienteId: cliente!.id }),
    enabled: !!cliente?.id,
  });
  const documentosResumenQuery = useQuery({
    queryKey: ["documentos", legajo],
    queryFn: () => listDocumentos(legajo),
    enabled: !!cliente,
  });

  const historialCambiosQuery = useQuery({
    queryKey: ["historial_cambios", legajo],
    queryFn: () => listHistorialCambios(legajo),
    enabled: !!cliente,
  });
  const validacionesQuery = useQuery({
    queryKey: ["validaciones", legajo],
    queryFn: () => listValidaciones(legajo),
    enabled: !!cliente,
  });
  const alertasQuery = useQuery({
    queryKey: ["alertas", legajo],
    queryFn: () => listAlertas(legajo),
    enabled: !!cliente,
  });
  const bloqueosQuery = useQuery({
    queryKey: ["bloqueos", legajo],
    queryFn: () => listBloqueos(legajo),
    enabled: !!cliente,
  });
  const modulosQuery = useQuery({
    queryKey: ["cliente_modulos", legajo],
    queryFn: () => listClienteModulos(legajo),
    enabled: !!cliente,
  });
  const paramAlertasQuery = useQuery({
    queryKey: ["param_alertas", legajo],
    queryFn: () => listParametrosAlertas(legajo),
    enabled: !!cliente,
  });
  const paramBloqueosQuery = useQuery({
    queryKey: ["param_bloqueos", legajo],
    queryFn: () => listParametrosBloqueos(legajo),
    enabled: !!cliente,
  });
  const comerciosPstQuery = useQuery({
    queryKey: ["comercios_pst", legajo],
    queryFn: () => listComerciosPst(legajo),
    enabled: !!cliente,
  });
  const linksPagoQuery = useQuery({
    queryKey: ["links_pago", legajo],
    queryFn: () => listLinksPago(legajo),
    enabled: !!cliente,
  });
  const clienteApiUsuariosQuery = useQuery({
    queryKey: ["cliente_api_usuarios", legajo],
    queryFn: () => listClienteApiUsuarios(legajo),
    enabled: !!cliente,
  });

  // === PLAFT: evaluaciones de riesgo (append-only) ===
  const evaluacionesQuery = useQuery({
    queryKey: ["cliente-evaluaciones-riesgo", legajo],
    queryFn: () => listEvaluacionesRiesgo(legajo),
    staleTime: 30_000,
  });
  const riesgoVigente = (evaluacionesQuery.data ?? []).find((e) => e.vigente_hasta == null);
  const evaluacionesAnteriores = (evaluacionesQuery.data ?? []).filter(
    (e) => e.vigente_hasta != null,
  );

  const { data: catalogoEstados = [] } = useEstadosMovimiento();

  const modulosData = modulosQuery.data ?? [];
  const apiModulo = modulosData.find((m) => m.clave === "api");
  const comerciosPst = comerciosPstQuery.data ?? [];
  const linksPago = linksPagoQuery.data ?? [];
  const apiUsuariosVinculados = clienteApiUsuariosQuery.data ?? [];
  // cantidad real prevalece sobre desnormalizado cliente_modulos.cantidad
  const apiCantidadReal = clienteApiUsuariosQuery.isSuccess
    ? apiUsuariosVinculados.length
    : (apiModulo?.cantidad ?? 0);

  return {
    cliente,
    isLoading,
    isError,
    error,
    refetch,
    movimientos,
    subcuentasQuery,
    impuestosQuery,
    comisionesQuery,
    comisionesRealesQuery,
    documentosResumenQuery,
    historialCambiosQuery,
    validacionesQuery,
    alertasQuery,
    bloqueosQuery,
    modulosQuery,
    paramAlertasQuery,
    paramBloqueosQuery,
    comerciosPstQuery,
    linksPagoQuery,
    clienteApiUsuariosQuery,
    evaluacionesQuery,
    riesgoVigente,
    evaluacionesAnteriores,
    catalogoEstados,
    modulosData,
    comerciosPst,
    linksPago,
    apiCantidadReal,
  };
}

export type ClienteDetalleData = ReturnType<typeof useClienteDetalle>;
