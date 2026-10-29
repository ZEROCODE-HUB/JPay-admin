import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  borrarPersonaKyb,
  consultarAltaCobre,
  consultarBalanceCobre,
  crearBalancesMatriz,
  decidirTransferenciaCobre,
  desactivarInstanciaCobre,
  devolverDepositoCobre,
  enviarAltaCobre,
  getAltaCobre,
  getConfiguracionCobre,
  getDatosKyb,
  getInstanciaCobre,
  getSuscripcionMatriz,
  guardarConfiguracionCobre,
  guardarEmpresaKyb,
  guardarInstanciaCobre,
  guardarPersonaKyb,
  listBalancesMatriz,
  listDepositosSinAsignar,
  listLotesPorAprobar,
  listTransferenciasCobre,
  simularDepositoCobre,
  simularPagoR2p,
  suscribirAvisosCobre,
  vincularBalanceInstancia,
} from "@/lib/api/cobre";
import type { PersonaKyb } from "@/shared/cobre-kyb";
import type { EmpresaKyb } from "@/shared/ui/kyb-cobre";

const KEY = ["cobre"] as const;

export function useCobreAdmin() {
  return {
    configuracion: useQuery({
      queryKey: [...KEY, "configuracion"],
      queryFn: getConfiguracionCobre,
    }),
    balances: useQuery({ queryKey: [...KEY, "balances"], queryFn: listBalancesMatriz }),
    suscripcion: useQuery({ queryKey: [...KEY, "suscripcion"], queryFn: getSuscripcionMatriz }),
    aprobaciones: useQuery({
      queryKey: [...KEY, "aprobaciones"],
      queryFn: () => listTransferenciasCobre(["pendiente_aprobacion"]),
      refetchInterval: 30_000,
    }),
    lotes: useQuery({
      queryKey: [...KEY, "lotes"],
      queryFn: listLotesPorAprobar,
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
    crearBalances: useMutation({ mutationFn: crearBalancesMatriz, onSuccess }),
    consultarBalance: useMutation({ mutationFn: consultarBalanceCobre, onSuccess }),
    suscribir: useMutation({ mutationFn: suscribirAvisosCobre, onSuccess }),
    decidir: useMutation({ mutationFn: decidirTransferenciaCobre, onSuccess }),
    devolver: useMutation({ mutationFn: devolverDepositoCobre, onSuccess }),
    simularDeposito: useMutation({ mutationFn: simularDepositoCobre, onSuccess }),
    simularPagoR2p: useMutation({ mutationFn: simularPagoR2p, onSuccess }),
  };
}

/** Alta del comercio en Cobre (Subcliente), sus datos KYB y su instancia propia, si tiene. */
export function useCobreCliente(legajo: string) {
  const qc = useQueryClient();
  const k = [...KEY, "cliente", legajo] as const;
  const refrescar = () => qc.invalidateQueries({ queryKey: k });
  const alta = useQuery({
    queryKey: [...k, "alta"],
    queryFn: () => getAltaCobre(legajo),
    refetchInterval: (q) =>
      ["enviando", "processing"].includes(q.state.data?.alta?.estado ?? "") ? 15_000 : false,
  });
  return {
    alta,
    kyb: useQuery({ queryKey: [...k, "kyb"], queryFn: () => getDatosKyb(legajo) }),
    instancia: useQuery({
      queryKey: [...k, "instancia"],
      queryFn: () => getInstanciaCobre(legajo),
    }),
    enviar: useMutation({ mutationFn: () => enviarAltaCobre(legajo), onSettled: refrescar }),
    consultar: useMutation({ mutationFn: () => consultarAltaCobre(legajo), onSettled: refrescar }),
    guardarEmpresa: (e: EmpresaKyb) => guardarEmpresaKyb(legajo, e).then(refrescar),
    guardarPersona: (p: PersonaKyb) => guardarPersonaKyb(legajo, p).then(refrescar),
    borrarPersona: (id: string) => borrarPersonaKyb(id).then(refrescar),
    guardarInstancia: useMutation({ mutationFn: guardarInstanciaCobre, onSettled: refrescar }),
    desactivarInstancia: useMutation({
      mutationFn: desactivarInstanciaCobre,
      onSettled: refrescar,
    }),
    vincularBalance: useMutation({
      mutationFn: (v: { id: string; cuenta?: string }) => vincularBalanceInstancia(v.id, v.cuenta),
      onSettled: refrescar,
    }),
    suscribir: useMutation({ mutationFn: suscribirAvisosCobre, onSettled: refrescar }),
  };
}
