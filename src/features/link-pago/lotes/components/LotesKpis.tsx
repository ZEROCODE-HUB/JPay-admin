import { Badge, Card } from "@/components/portal-shell";
import type { ResumenKpi, ResumenLotesAdmin } from "@/lib/api/lotes";
import { formatMoney } from "@/shared/format";
import type { Tono } from "../estados";

function Kpi({
  label,
  badge,
  tone,
  valueClass = "",
  kpi,
}: {
  label: string;
  badge: string;
  tone: Tono;
  valueClass?: string;
  kpi: ResumenKpi | undefined;
}) {
  return (
    <Card className="p-3">
      <div className="text-xs text-muted-foreground flex items-center justify-between">
        <span>{label}</span>
        <Badge tone={tone}>{badge}</Badge>
      </div>
      <div className={`font-mono text-xl font-semibold mt-1 ${valueClass}`}>
        {kpi?.cantidad ?? 0}
      </div>
      <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
        {formatMoney(kpi?.monto ?? 0)}
      </div>
    </Card>
  );
}

/** KPIs: 4 cards por estado. Mismas fechas que la grilla. */
export function LotesKpis({ resumen }: { resumen: ResumenLotesAdmin | undefined }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <Kpi label="Programados" badge="est." tone="neutral" kpi={resumen?.programados} />
      <Kpi
        label="Pendientes"
        badge="Pend."
        tone="warn"
        valueClass="text-amber-700"
        kpi={resumen?.pendientes}
      />
      <Kpi
        label="Acreditados (Mes)"
        badge="OK"
        tone="success"
        valueClass="text-emerald-700"
        kpi={resumen?.acreditados}
      />
      <Kpi
        label="Contracargo"
        badge="Disc."
        tone="danger"
        valueClass="text-danger-600"
        kpi={resumen?.contracargo}
      />
    </div>
  );
}
