import { Info } from "lucide-react";

export function ImpuestosBanner() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-muted bg-muted/30 px-4 py-3 text-sm text-muted-foreground mb-4">
      <Info size={16} className="shrink-0 mt-0.5" />
      <p>
        Vista transversal: muestra la columna <strong>impuesto</strong> (retención impositiva al
        cliente) de movimientos de <strong>todos los tipos</strong>. La tabla no tiene desglose por
        tipo/nombre de impuesto; el IVA sobre la comisión se ve en el detalle de cada movimiento.
      </p>
    </div>
  );
}
