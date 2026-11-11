import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/portal-shell";
import type { DashboardDetalle } from "@/lib/api/dashboard";
import { formatDateTime, formatMoney, formatNumber } from "@/shared/format";
import { InfoTip } from "@/shared/ui/info-tip";
import { brand } from "@/brand/brand";

type Props = { d?: DashboardDetalle; isLoading: boolean; isError: boolean };

const diaDelMes = (iso: string) => Number(iso.slice(8, 10));

/** Gráfico de volumen transaccional (14 días) + estado de conexiones y tareas programadas. */
export function VolumenSistemaRow({ d, isLoading, isError }: Props) {
  const puntos = d?.volumen14d ?? [];
  const max = Math.max(1, ...puntos.map((p) => p.monto));
  const total = puntos.reduce((s, p) => s + p.monto, 0);
  const aviso = isLoading ? "Cargando…" : isError ? "No se pudo cargar." : null;

  return (
    <div className="grid lg:grid-cols-3 gap-6 mb-6">
      <Card className="lg:col-span-2">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold">
              Volumen transaccional{" "}
              <InfoTip>
                Suma diaria de todas las operaciones contabilizadas en el libro contable de{" "}
                {brand.name}, solo en la moneda del país (MXN), de los últimos 14 días contados en
                hora de México. Pasa el mouse sobre una barra para ver el monto y la cantidad de ese
                día.
              </InfoTip>
            </h3>
            <p className="text-xs text-muted-foreground">
              Últimos 14 días — {d?.moneda ?? "—"}
              {d && ` · ${formatMoney(total, { moneda: d.moneda })} en total`}
            </p>
          </div>
        </div>
        {aviso || total === 0 ? (
          <div className="flex items-center justify-center h-44 text-sm text-muted-foreground">
            {aviso ?? "Sin movimientos en los últimos 14 días."}
          </div>
        ) : (
          <div className="flex items-end gap-1.5 h-44">
            {puntos.map((p) => (
              <div
                key={p.dia}
                className="flex-1 h-full flex flex-col items-center justify-end gap-1"
                title={`${p.dia}: ${formatMoney(p.monto, { moneda: d?.moneda })} · ${formatNumber(p.operaciones)} operaciones`}
              >
                <div
                  className="w-full rounded-t bg-gradient-to-t from-secondary to-primary"
                  style={{ height: `${p.monto > 0 ? Math.max(2, (p.monto / max) * 100) : 0}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{diaDelMes(p.dia)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-display font-semibold mb-4">
          Estado del sistema{" "}
          <InfoTip align="right">
            Resultado de la última prueba de conexión de cada proveedor activo (Cobre, Ecart Pay) y
            la última corrida de las tareas automáticas. Una tarea se marca atrasada si no corre en
            15 min (revisión de pendientes), 26 h (conciliación diaria) o 5 min (simulador de
            Cobre).
          </InfoTip>
        </h3>
        {aviso ? (
          <p className="text-sm text-muted-foreground">{aviso}</p>
        ) : (d?.estadoSistema ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin proveedores activos ni tareas.</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {d!.estadoSistema.map((s) => (
              <li key={s.nombre} className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-2 min-w-0">
                  {s.ok ? (
                    <CheckCircle2 size={16} className="text-primary-ink shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-amber-600 shrink-0" />
                  )}
                  <span className="truncate">{s.nombre}</span>
                </span>
                <span className="text-right text-xs text-muted-foreground tabular-nums shrink-0">
                  {s.ok || !s.at ? s.detalle : "Atrasada"}
                  {s.at && (
                    <span className="block font-mono text-[11px]">{formatDateTime(s.at)}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
