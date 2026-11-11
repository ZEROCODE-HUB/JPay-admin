import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/portal-shell";
import { useAlertasProveedor } from "@/hooks/usePaises";
import { InfoTip } from "@/shared/ui/info-tip";
import { brand } from "@/brand/brand";

/**
 * Monitoreo de un proveedor: avisos fallidos, tareas atrasadas, conciliación y lo propio de cada
 * uno (pagos y contracargos en Ecart Pay; transferencias, aprobaciones y depósitos en Cobre).
 * Se recalcula cada minuto.
 */
export function AlertasProveedorCard({ proveedor, nombre }: { proveedor: string; nombre: string }) {
  const { data, isLoading, error } = useAlertasProveedor(proveedor);
  const alertas = data ?? [];
  return (
    <Card>
      <h3 className="font-semibold">
        Alertas de {nombre}{" "}
        <InfoTip>
          Revisión automática que hace {brand.name} sobre sus propios registros de {nombre}: avisos
          (webhooks) que fallaron, tareas automáticas atrasadas, la última conciliación y
          operaciones trabadas (pagos, reembolsos y contracargos en Ecart Pay; transferencias,
          aprobaciones y depósitos en Cobre). Se recalcula cada minuto.
        </InfoTip>
      </h3>
      {isLoading ? (
        <p className="mt-2 text-sm text-muted-foreground">Revisando…</p>
      ) : error ? (
        <p className="mt-2 text-sm text-danger-600">
          No se pudieron calcular las alertas: {error.message}
        </p>
      ) : alertas.length === 0 ? (
        <p className="mt-2 flex items-center gap-2 text-sm">
          <CheckCircle2 size={16} className="text-primary-ink" /> Todo en orden.
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
