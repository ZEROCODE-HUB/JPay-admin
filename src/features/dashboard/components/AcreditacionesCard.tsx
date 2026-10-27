import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/portal-shell";
import { brand } from "@/brand/brand";

/** Acreditaciones de Link de Pago en formato operación (sin datos hasta conectar la base). */
export function AcreditacionesCard() {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Acreditaciones — Link de Pago
        </h3>
        <Link
          to="/admin/comercios/link-pago/resumen"
          className="text-xs text-primary-ink font-semibold inline-flex items-center gap-1"
        >
          Ver detalle <ArrowUpRight size={12} />
        </Link>
      </div>
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Bruto</span>
              <span className="font-mono font-semibold">—</span>
            </div>
            <div className="flex justify-between gap-4 text-xs">
              <span className="text-muted-foreground">− Impuestos</span>
              <span className="font-mono">—</span>
            </div>
            <div className="flex justify-between gap-4 text-xs">
              <span className="text-muted-foreground">− Comisión PayWay (3%)</span>
              <span className="font-mono">—</span>
            </div>
            <div className="flex justify-between gap-4 text-xs">
              <span className="text-muted-foreground">− Comisión {brand.name} (neto)</span>
              <span className="font-mono">—</span>
            </div>
            <div className="border-t my-1.5" />
            <div className="flex justify-between gap-4 font-semibold">
              <span>Neto {brand.name}</span>
              <span className="font-mono">—</span>
            </div>
            <div className="flex justify-between gap-4 text-xs text-muted-foreground">
              <span>Pendiente de acreditar</span>
              <span className="font-mono">—</span>
            </div>
          </div>
          <div className="space-y-1.5 text-sm md:border-l md:pl-6 pt-4 md:pt-0 border-t md:border-t-0">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Cuenta recaudadora</span>
              <span className="font-mono font-semibold">—</span>
            </div>
            <div className="flex justify-between gap-4 text-xs">
              <span className="text-muted-foreground">Disponible</span>
              <span className="font-mono">—</span>
            </div>
            <div className="flex justify-between gap-4 text-xs">
              <span className="text-muted-foreground">+ Pendiente</span>
              <span className="font-mono">—</span>
            </div>
            <div className="border-t my-1.5" />
            <div className="flex justify-between gap-4 font-semibold">
              <span>Total</span>
              <span className="font-mono">—</span>
            </div>
            <div className="text-[11px] text-muted-foreground">Período hoy</div>
          </div>
        </div>
      </Card>
    </>
  );
}
