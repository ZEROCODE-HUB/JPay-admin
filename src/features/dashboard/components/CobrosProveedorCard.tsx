import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/portal-shell";
import type { DashboardDetalle } from "@/lib/api/dashboard";
import { formatMoney, formatNumber } from "@/shared/format";
import { InfoTip } from "@/shared/ui/info-tip";
import { brand } from "@/brand/brand";

type Props = { d?: DashboardDetalle; isLoading: boolean; isError: boolean };

const METODO: Record<string, string> = { tarjeta: "Tarjeta", spei: "SPEI", oxxo: "OXXO" };

/** Cobros de enlaces de pago con Ecart Pay en el mes. */
export function CobrosProveedorCard({ d, isLoading, isError }: Props) {
  const c = d?.cobrosMes;
  const m = (n: number) => formatMoney(n, { moneda: d?.moneda });
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Cobros del mes — Enlaces de pago (Ecart Pay)
          <InfoTip className="ml-1">
            Cobros con Ecart Pay registrados en {brand.name} (enlaces de pago) pagados desde el día
            1 del mes en curso (hora de México), incluidos los que después se reembolsaron total o
            parcialmente. Cobrado es el monto bruto; Neto descuenta la comisión de Ecart Pay, no los
            reembolsos. «Conciliados» son los que ya se cotejaron con el reporte de Ecart Pay.
          </InfoTip>
        </h3>
        <Link
          to="/admin/configuracion/paises"
          className="text-xs text-primary-ink font-semibold inline-flex items-center gap-1"
        >
          Conciliación <ArrowUpRight size={12} />
        </Link>
      </div>
      <Card className="p-4 mb-6">
        {isLoading || isError || !c ? (
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Cargando…" : "No se pudo cargar."}
          </p>
        ) : c.cantidad === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay cobros pagados este mes.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Cobrado ({formatNumber(c.cantidad)} cobros)
                </span>
                <span className="font-mono font-semibold">{m(c.bruto)}</span>
              </div>
              <div className="flex justify-between gap-4 text-xs">
                <span className="text-muted-foreground">− Comisión de Ecart Pay</span>
                <span className="font-mono">{m(c.comisionProveedor)}</span>
              </div>
              <div className="border-t my-1.5" />
              <div className="flex justify-between gap-4 font-semibold">
                <span>Neto</span>
                <span className="font-mono">{m(c.neto)}</span>
              </div>
              {c.reembolsado > 0 && (
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-muted-foreground">Reembolsado</span>
                  <span className="font-mono">{m(c.reembolsado)}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground pt-1">
                {formatNumber(c.conciliados)} de {formatNumber(c.cantidad)} conciliados con Ecart
                Pay
              </p>
            </div>
            <div className="space-y-1.5 text-sm">
              <p className="text-xs font-medium text-muted-foreground">
                Por método{" "}
                <InfoTip>
                  Los mismos cobros del mes agrupados por forma de pago (tarjeta, SPEI, OXXO), con
                  su cantidad y monto bruto. Si un cobro no indica método, cuenta como tarjeta.
                </InfoTip>
              </p>
              {Object.entries(c.porMetodo).map(([metodo, v]) => (
                <div key={metodo} className="flex justify-between gap-4">
                  <span>
                    {METODO[metodo] ?? metodo}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({formatNumber(v.cantidad)})
                    </span>
                  </span>
                  <span className="font-mono">{m(v.monto)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
