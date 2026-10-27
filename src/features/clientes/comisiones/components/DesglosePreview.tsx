import { formatMoney } from "@/shared/format";
import type { Desglose } from "@/lib/aranceles";

/** Cuánto se le cobra al cliente sobre una operación de $ 100.000. */
export function DesglosePreview({ desglose }: { desglose: Desglose }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5 text-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Desglose del cobro (sobre $ 100.000 de operación)
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Comisión</span>
        <span className="font-mono tabular-nums">{formatMoney(desglose.comision)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Impuesto ({desglose.porcentajeImpuesto}%)</span>
        <span className="font-mono tabular-nums">{formatMoney(desglose.impuesto)}</span>
      </div>
      <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
        <span>Monto cobrado al cliente</span>
        <span className="font-mono tabular-nums">{formatMoney(desglose.total)}</span>
      </div>
    </div>
  );
}
