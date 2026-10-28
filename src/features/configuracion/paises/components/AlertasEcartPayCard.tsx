import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/portal-shell";
import { useAlertasEcartPay } from "@/hooks/usePaises";

/**
 * Monitoreo de Ecart Pay: avisos fallidos, tareas atrasadas, conciliación, pagos pendientes
 * viejos, contracargos por vencer y conexiones en error. Se recalcula cada minuto.
 */
export function AlertasEcartPayCard() {
  const { data, isLoading, error } = useAlertasEcartPay();
  const alertas = data ?? [];
  return (
    <Card>
      <h3 className="font-semibold">Alertas de Ecart Pay</h3>
      {isLoading ? (
        <p className="mt-2 text-sm text-muted-foreground">Revisando…</p>
      ) : error ? (
        <p className="mt-2 text-sm text-danger-600">
          No se pudieron calcular las alertas: {error.message}
        </p>
      ) : alertas.length === 0 ? (
        <p className="mt-2 flex items-center gap-2 text-sm">
          <CheckCircle2 size={16} className="text-primary-ink" /> Todo en orden: avisos, tareas,
          conciliación, pagos pendientes y contracargos.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm">
          {alertas.map((a) => (
            <li key={a.codigo} className="flex items-start gap-2">
              {a.nivel === "critica" ? (
                <XCircle size={16} className="mt-0.5 shrink-0 text-danger-500" />
              ) : (
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
              )}
              <span>{a.detalle}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
