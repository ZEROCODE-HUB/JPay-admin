import { formatMoney } from "@/shared/format";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Card, PageHeader } from "@/components/portal-shell";
import { brand } from "@/brand/brand";

export const Route = createFileRoute("/admin/administracion/registros/total")({
  head: () => ({ meta: [{ title: "Total de fondos — Admin Panel" }] }),
  component: Page,
});

function Page() {
  const interno = 45_200_000;
  const impuestos = 1_800_000;
  const banco = 46_500_000;
  const internoNuevo = 46_800_000;

  const formula1 = interno + impuestos - banco;
  const formula2 = internoNuevo - banco;

  return (
    <>
      <PageHeader
        title="Total de fondos"
        description={`Control crítico: detecta cuando ${brand.name} informa a clientes un monto mayor al real en la cuenta recaudadora.`}
      />

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 flex gap-3">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-300">
          Detecta cuando {brand.name} informa a clientes un monto mayor al real en la cuenta
          recaudadora — <strong>control crítico</strong>.
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="font-display font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
            Fórmula 1 (ARS)
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Interno de usuarios</span>
              <span className="font-semibold">{formatMoney(interno)}</span>
            </div>
            <div className="flex justify-between">
              <span>+ Impuestos cobrados</span>
              <span className="font-semibold">{formatMoney(impuestos)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Subtotal</span>
              <span className="font-semibold">{formatMoney(interno + impuestos)}</span>
            </div>
            <div className="flex justify-between">
              <span>− Banco</span>
              <span className="font-semibold">{formatMoney(banco)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg">
              <span className="font-semibold">Diferencia</span>
              <span className={`font-bold ${formula1 < 0 ? "text-danger-600" : "text-green-600"}`}>
                {formatMoney(formula1, { signo: true })}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
            Fórmula 2 (ARS) — Interno nuevo
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Interno de usuarios (nuevo)</span>
              <span className="font-semibold">{formatMoney(internoNuevo)}</span>
            </div>
            <div className="flex justify-between">
              <span>− Banco</span>
              <span className="font-semibold">{formatMoney(banco)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg">
              <span className="font-semibold">Diferencia</span>
              <span className={`font-bold ${formula2 < 0 ? "text-danger-600" : "text-green-600"}`}>
                {formatMoney(formula2, { signo: true })}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
