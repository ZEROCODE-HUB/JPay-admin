import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  conectarCobreCliente,
  desconectarCobreCliente,
  desvincularTarjeta,
  getConexionCobreCliente,
  iniciarVinculacionTarjeta,
  listConexionesTarjeta,
} from "@/lib/api/conexiones-cliente";

const KEY = ["conexiones-cliente"] as const;

/** Cobros con tarjeta: comercios del cliente y su conexión. */
export function useConexionesTarjeta(legajo: string) {
  const qc = useQueryClient();
  const k = [...KEY, legajo, "tarjeta"] as const;
  const refrescar = () => {
    void qc.invalidateQueries({ queryKey: k });
    // La lista general de Integraciones y los productos del cliente dependen de esto.
    void qc.invalidateQueries({ queryKey: ["paises"] });
    void qc.invalidateQueries({ queryKey: ["clientes", legajo, "productos-mx"] });
  };
  return {
    comercios: useQuery({ queryKey: k, queryFn: () => listConexionesTarjeta(legajo) }),
    vincular: useMutation({
      mutationFn: (v: { comercioId: string; volverA: string }) =>
        iniciarVinculacionTarjeta(v.comercioId, v.volverA),
    }),
    desvincular: useMutation({ mutationFn: desvincularTarjeta, onSuccess: refrescar }),
  };
}

/** Cuenta Cobre propia del cliente (conexión en un paso). */
export function useConexionCobreCliente(legajo: string) {
  const qc = useQueryClient();
  const k = [...KEY, legajo, "cobre"] as const;
  const refrescar = () => {
    void qc.invalidateQueries({ queryKey: k });
    void qc.invalidateQueries({ queryKey: ["cobre", "cliente", legajo] });
    void qc.invalidateQueries({ queryKey: ["clientes", legajo, "productos-mx"] });
  };
  return {
    conexion: useQuery({ queryKey: k, queryFn: () => getConexionCobreCliente(legajo) }),
    conectar: useMutation({ mutationFn: conectarCobreCliente, onSuccess: refrescar }),
    desconectar: useMutation({
      mutationFn: () => desconectarCobreCliente(legajo),
      onSuccess: refrescar,
    }),
  };
}
