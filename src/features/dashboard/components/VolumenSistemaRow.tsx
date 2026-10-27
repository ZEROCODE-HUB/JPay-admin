import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/portal-shell";

// Sin datos hasta conectar con la base: volumen y estado del sistema eran valores de ejemplo
// escritos a mano.
const volumeData: number[] = [];

/** Gráfico de volumen transaccional + estado del sistema. */
export function VolumenSistemaRow() {
  const max = Math.max(1, ...volumeData);
  return (
    <div className="grid lg:grid-cols-3 gap-6 mb-6">
      <Card className="lg:col-span-2">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold">Volumen transaccional</h3>
            <p className="text-xs text-muted-foreground">ultimos 14 dias — ARS</p>
          </div>
        </div>
        {volumeData.length === 0 && (
          <div className="flex items-center justify-center h-44 text-sm text-muted-foreground">
            Sin datos de volumen.
          </div>
        )}
        <div className={`flex items-end gap-1.5 h-44 ${volumeData.length === 0 ? "hidden" : ""}`}>
          {volumeData.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-gradient-to-t from-secondary to-primary"
                style={{ height: `${(v / max) * 100}%` }}
              />
              <span className="text-[10px] text-muted-foreground">{i + 1}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold mb-4">Estado del sistema</h3>
        <p className="text-sm text-muted-foreground">Sin monitoreo configurado.</p>
        <ul className="space-y-3 text-sm">
          {([] as string[][]).map(([n, e, l]) => (
            <li key={n} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {e === "operativo" ? (
                  <CheckCircle2 size={16} className="text-primary-ink" />
                ) : (
                  <XCircle size={16} className="text-amber-600" />
                )}
                {n}
              </span>
              <span className="text-xs text-muted-foreground font-mono tabular-nums">{l}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
