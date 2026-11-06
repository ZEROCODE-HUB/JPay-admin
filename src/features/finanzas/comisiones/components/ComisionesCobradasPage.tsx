import { Info } from "lucide-react";
import { MovimientosSubRoute } from "@/features/movimientos/subruta/components/MovimientosSubRoute";

/** Movimientos de todos los tipos con comisión cobrada al cliente. */
export function ComisionesCobradasPage() {
  return (
    <>
      <div className="flex items-start gap-2 rounded-lg border border-muted bg-muted/30 px-4 py-3 text-sm text-muted-foreground mb-4">
        <Info size={16} className="shrink-0 mt-0.5" />
        <p>
          Movimientos de <strong>todos los tipos</strong> en los que se cobró comisión. La modalidad
          (porcentaje o monto fijo) se configura en <strong>Carga por cliente</strong> y no se
          muestra por movimiento; el IVA de la comisión está en la columna <strong>Impuesto</strong>
          .
        </p>
      </div>
      <MovimientosSubRoute
        titulo="Comisiones cobradas"
        descripcion="Comisiones cobradas a los clientes por sus operaciones, con el desglose de comisión, IVA y monto cobrado."
        soloConComision
      />
    </>
  );
}
