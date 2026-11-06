import { createFileRoute, Outlet } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { PageHeader } from "@/components/portal-shell";
import { TabLayout, type Tab } from "@/components/tab-layout";

export const Route = createFileRoute("/admin/control/conciliacion")({
  component: ConciliacionLayout,
  head: () => ({
    meta: [
      { title: pageTitle("Conciliación — Admin") },
      { name: "description", content: "Conciliación diaria de JPay con Ecart Pay y con Cobre." },
    ],
  }),
});

const tabs: Tab[] = [
  { label: "Ecart Pay", to: "/admin/control/conciliacion/ecartpay", modulo: "pagos_proveedor" },
  { label: "Cobre", to: "/admin/control/conciliacion/cobre", modulo: "transferencias_cobre" },
];

function ConciliacionLayout() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Conciliación"
        description="Cruce diario de las operaciones de JPay con las de cada proveedor y bandeja de diferencias."
      />
      <TabLayout tabs={tabs}>
        <Outlet />
      </TabLayout>
    </div>
  );
}
