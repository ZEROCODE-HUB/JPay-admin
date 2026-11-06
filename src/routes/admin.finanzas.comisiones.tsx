import { createFileRoute, Outlet } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { TabLayout, type Tab } from "@/components/tab-layout";

export const Route = createFileRoute("/admin/finanzas/comisiones")({
  component: ComisionesLayout,
  head: () => ({
    meta: [
      { title: pageTitle("Comisiones — Admin") },
      {
        name: "description",
        content: "Ingresos de JPay por comisiones, comisiones cobradas y carga por cliente.",
      },
    ],
  }),
});

const tabs: Tab[] = [
  { label: "Ingresos JPay", to: "/admin/finanzas/comisiones" },
  { label: "Cobradas", to: "/admin/finanzas/comisiones/cobradas" },
  { label: "Carga por cliente", to: "/admin/finanzas/comisiones/carga" },
];

function ComisionesLayout() {
  return (
    <TabLayout tabs={tabs}>
      <Outlet />
    </TabLayout>
  );
}
