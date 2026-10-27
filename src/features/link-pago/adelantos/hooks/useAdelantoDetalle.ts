import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  acreditarAdelanto,
  aprobarAdelanto,
  calcularTopeDisponible,
  getComercioIdDeAdelanto,
  obtenerPoolRecaudacion,
  rechazarAdelanto,
  type PoolRecaudacion,
} from "@/lib/api/adelantos";
import { formatMoney } from "@/shared/format";
import {
  esTasaTipeable,
  interesAdelanto,
  netoAdelanto,
  parseTasa,
  poolInsuficiente as calcPoolInsuficiente,
  validarTasa,
  type AdelantoUI,
} from "../utils";

/**
 * Formulario y acciones del modal de un adelanto. Según el estado:
 *  - Pendiente: el admin puede Aprobar (carga TEM) o Rechazar.
 *  - Aprobado: el admin puede Acreditar (mueve plata) o Rechazar.
 *  - Acreditado: solo lectura.
 */
export function useAdelantoDetalle(
  a: AdelantoUI,
  {
    onClose,
    onSave,
    onAcreditado,
  }: { onClose: () => void; onSave: () => void; onAcreditado: () => void },
) {
  const [tasaInteres, setTasaInteresRaw] = useState<string>(
    a.tasaInteresPct != null ? String(a.tasaInteresPct) : "",
  );
  const [notas, setNotas] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [tope, setTope] = useState<number | null>(null);

  // Sólo se muestra el tope cuando el adelanto está en revisión
  // (Pendiente o Aprobado). Es informativo: le dice al admin cuánto le
  // queda al comercio para pedir más adelantos.
  useEffect(() => {
    if (a.estado !== "Pendiente" && a.estado !== "Aprobado") {
      setTope(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const comercioId = await getComercioIdDeAdelanto(a.fullId);
      if (cancelled || !comercioId) return;
      const t = await calcularTopeDisponible(comercioId);
      if (!cancelled) setTope(t);
    })();
    return () => {
      cancelled = true;
    };
  }, [a.fullId, a.estado]);

  const tasaPctNum = useMemo(() => parseTasa(tasaInteres), [tasaInteres]);
  const interesEstimado = useMemo(
    () => interesAdelanto(a.importeSolicitado, tasaPctNum),
    [a.importeSolicitado, tasaPctNum],
  );
  const netoEstimado = useMemo(
    () => netoAdelanto(a.importeSolicitado, interesEstimado),
    [a.importeSolicitado, interesEstimado],
  );

  // Pool de Recaudación: se consulta solo cuando el adelanto está
  // Aprobado (único caso donde "Acreditar" podría habilitarse).
  const { data: pool } = useQuery<PoolRecaudacion>({
    queryKey: ["pool-recaudacion", a.fullId],
    queryFn: () => obtenerPoolRecaudacion(),
    enabled: a.estado === "Aprobado",
    refetchInterval: 30_000, // refresca cada 30s mientras el modal está abierto
  });
  const poolInsuficiente = calcPoolInsuficiente(
    a.estado,
    pool?.cupoDisponiblePool,
    a.importeSolicitado,
  );

  const handleAprobar = async () => {
    const err = validarTasa(tasaPctNum);
    if (err || tasaPctNum == null) {
      toast.error(err);
      return;
    }
    setBusy(true);
    try {
      const r = await aprobarAdelanto(a.fullId, tasaPctNum, notas.trim() || undefined);
      onSave();
      toast.success(`Adelanto aprobado — TEM ${r.tasaPct}%`);
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleRechazar = async () => {
    if (!notas.trim()) {
      toast.error("Cargá un motivo de rechazo en el campo de notas");
      return;
    }
    setBusy(true);
    try {
      await rechazarAdelanto(a.fullId, notas.trim());
      onSave();
      toast.success("Adelanto rechazado");
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleAcreditar = async () => {
    if (a.estado !== "Aprobado") {
      toast.error("Solo se acreditan adelantos en estado Aprobado");
      return;
    }
    setBusy(true);
    try {
      const r = await acreditarAdelanto(a.fullId, notas.trim() || undefined);
      toast.success(
        `Adelanto acreditado. Depósito neto: ${formatMoney(r.montoNetoDepositado)} (interés ${formatMoney(r.interes)}).`,
      );
      onAcreditado();
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return {
    tasaInteres,
    setTasaInteres: (v: string) => {
      if (!esTasaTipeable(v)) return;
      setTasaInteresRaw(v);
    },
    tasaPctNum,
    interesEstimado,
    netoEstimado,
    notas,
    setNotas,
    busy,
    tope,
    pool,
    poolInsuficiente,
    readOnly: a.estado === "Acreditado" || a.estado === "Cancelado",
    handleAprobar,
    handleRechazar,
    handleAcreditar,
  };
}

export type AdelantoDetalleState = ReturnType<typeof useAdelantoDetalle>;
