import { formatNumber } from "@/shared/format";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, Badge } from "@/components/portal-shell";
import { saludIconClass, saludMeta } from "../estados";
import type { IntegracionUI } from "../utils";

/** Vista operativa: una tarjeta por integración con su salud y ejecuciones. */
export function IntegracionesGrid({
  integraciones,
  isLoading,
  isError,
  isEmpty,
}: {
  integraciones: IntegracionUI[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
        Cargando integraciones…
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger-200 bg-danger-50 px-6 py-12 text-center text-sm text-danger-700">
        <AlertTriangle size={28} />
        <div>
          <p className="font-semibold">Error al cargar integraciones</p>
        </div>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        <ShieldCheck size={28} />
        <p>No hay integraciones configuradas.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {integraciones.map((i) => {
        const meta = saludMeta[i.salud];
        const Icon = meta.icon;
        return (
          <Card key={i.id} className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-base text-foreground truncate">
                  {i.nombre}
                </h3>
                <div className="font-mono text-[11px] text-muted-foreground mt-0.5 truncate">
                  {i.id}
                </div>
              </div>
              <Icon size={22} className={saludIconClass(i.salud)} />
            </div>

            <Badge tone={meta.tone} className="w-fit">
              {meta.label}
            </Badge>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Última ejecución
                </div>
                <div className="font-mono text-xs tabular-nums mt-1">{i.ultimaEjecucion}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Próxima ejecución
                </div>
                <div className="font-mono text-xs tabular-nums mt-1">{i.proximaEjecucion}</div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Ejecuciones totales</span>
              <span className="font-display text-lg font-semibold tabular-nums">
                {formatNumber(i.ejecuciones)}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
