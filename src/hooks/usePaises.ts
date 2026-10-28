import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  desconectarComercioEcartPay,
  getTareaProgramada,
  listEventosWebhook,
  listPuntosFisicos,
  reprocesarEventoWebhook,
  listConexionesComercios,
  listConfiguracionPagos,
  listFeriados,
  listPaises,
  listProveedoresPago,
  probarConexionEcartPay,
  setPaisPredeterminado,
  updateConfiguracionPagos,
  updatePais,
  updateProveedorPago,
  type ConfiguracionPagos,
  type Pais,
  type ProveedorPago,
} from "@/lib/api/paises";

const KEY = ["paises"] as const;

export function usePaisesConfig() {
  const paises = useQuery({ queryKey: [...KEY, "lista"], queryFn: listPaises });
  const proveedores = useQuery({ queryKey: [...KEY, "proveedores"], queryFn: listProveedoresPago });
  const configuracion = useQuery({
    queryKey: [...KEY, "configuracion"],
    queryFn: listConfiguracionPagos,
  });
  return {
    paises: paises.data ?? [],
    proveedores: proveedores.data ?? [],
    configuracion: configuracion.data ?? [],
    isLoading: paises.isLoading || proveedores.isLoading || configuracion.isLoading,
    error: (paises.error ?? proveedores.error ?? configuracion.error) as Error | null,
  };
}

export function useConexionesComercios() {
  return useQuery({ queryKey: [...KEY, "conexiones"], queryFn: listConexionesComercios });
}

/** Avisos de Ecart Pay y última corrida de la tarea de pendientes (se refresca cada 30 s). */
export function useEventosWebhook() {
  const eventos = useQuery({
    queryKey: [...KEY, "webhooks"],
    queryFn: () => listEventosWebhook(),
    refetchInterval: 30_000,
  });
  const tarea = useQuery({
    queryKey: [...KEY, "tarea", "ecartpay-pendientes"],
    queryFn: () => getTareaProgramada("ecartpay-pendientes"),
    refetchInterval: 30_000,
  });
  return { eventos, tarea };
}

export function usePuntosFisicos() {
  return useQuery({ queryKey: [...KEY, "puntos-fisicos"], queryFn: listPuntosFisicos });
}

export function useFeriados(pais: string | null, desde: string) {
  return useQuery({
    queryKey: [...KEY, "feriados", pais, desde],
    queryFn: () => listFeriados(pais as string, desde),
    enabled: !!pais,
  });
}

/** Mutaciones de la pantalla; todas invalidan la configuración de países. */
export function usePaisesMutaciones() {
  const qc = useQueryClient();
  const onSuccess = () => qc.invalidateQueries({ queryKey: KEY });
  return {
    actualizarPais: useMutation({
      mutationFn: (v: { codigo: string; cambios: Partial<Pick<Pais, "activo" | "modulos">> }) =>
        updatePais(v.codigo, v.cambios),
      onSuccess,
    }),
    predeterminar: useMutation({ mutationFn: setPaisPredeterminado, onSuccess }),
    actualizarProveedor: useMutation({
      mutationFn: (v: {
        codigo: string;
        cambios: Partial<Pick<ProveedorPago, "activo" | "sandbox">>;
      }) => updateProveedorPago(v.codigo, v.cambios),
      onSuccess,
    }),
    probarEcartPay: useMutation({ mutationFn: probarConexionEcartPay, onSuccess }),
    desconectarComercio: useMutation({ mutationFn: desconectarComercioEcartPay, onSuccess }),
    reprocesarEvento: useMutation({ mutationFn: reprocesarEventoWebhook, onSuccess }),
    guardarConfiguracion: useMutation({
      mutationFn: (c: ConfiguracionPagos) => updateConfiguracionPagos(c.pais, c.proveedor, c),
      onSuccess,
    }),
  };
}
