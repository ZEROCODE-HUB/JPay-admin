import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  crearCuentaPlataformaCobre,
  decidirTransferenciaCobre,
  getConfiguracionCobre,
  guardarConfiguracionCobre,
  listDepositosSinAsignar,
  listTransferenciasCobre,
  simularDepositoCobre,
} from "@/lib/api/cobre";

const KEY = ["cobre"] as const;

export function useCobreAdmin() {
  return {
    configuracion: useQuery({
      queryKey: [...KEY, "configuracion"],
      queryFn: getConfiguracionCobre,
    }),
    aprobaciones: useQuery({
      queryKey: [...KEY, "aprobaciones"],
      queryFn: () => listTransferenciasCobre(["pendiente_aprobacion"]),
      refetchInterval: 30_000,
    }),
    sinAsignar: useQuery({
      queryKey: [...KEY, "sin-asignar"],
      queryFn: listDepositosSinAsignar,
      refetchInterval: 60_000,
    }),
  };
}

export function useCobreAdminMutaciones() {
  const qc = useQueryClient();
  const onSuccess = () => qc.invalidateQueries({ queryKey: KEY });
  return {
    guardar: useMutation({ mutationFn: guardarConfiguracionCobre, onSuccess }),
    crearCuenta: useMutation({ mutationFn: crearCuentaPlataformaCobre, onSuccess }),
    decidir: useMutation({ mutationFn: decidirTransferenciaCobre, onSuccess }),
    simularDeposito: useMutation({ mutationFn: simularDepositoCobre, onSuccess }),
  };
}
