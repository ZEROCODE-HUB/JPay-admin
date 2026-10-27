import { createFileRoute } from "@tanstack/react-router";
import { brand, pageTitle } from "@/brand/brand";
import { PageHeader, Card } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { EmptyState } from "@/shared/ui/empty-state";

export const Route = createFileRoute("/admin/comercios/link-pago/resumen")({
  component: Page,
  head: () => ({
    meta: [
      { title: pageTitle("Resumen general — Link de Pago — Admin") },
      { name: "description", content: "Visión global de la operación de Link de Pago." },
    ],
  }),
});

// Los KPIs por período y la tabla por comercio mostraban datos de ejemplo.
// Quedan en estado vacío hasta conectarlos a la base.
function Page() {
  return (
    <PermissionGuard recurso="comercios">
      <PageHeader
        title="Resumen general"
        description={`Visión global de la operación de Link de Pago. Totales por período para ${brand.name}.`}
      />

      <Card className="p-4 mb-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Resultado económico del período
        </h4>
        <EmptyState
          title="Sin datos"
          description="Los totales de Link de Pago (pendiente, recaudadora, bruto, neto e impuestos) todavía no están conectados a la base."
        />
      </Card>

      <Card className="p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Impuestos y pagos asociados por comercio
        </h4>
        <EmptyState
          title="Sin datos"
          description={`Impuestos, comisiones ${brand.shortName}/PayWay, adelantos, acreditación y contracargos por comercio todavía no están conectados a la base.`}
        />
      </Card>
    </PermissionGuard>
  );
}
