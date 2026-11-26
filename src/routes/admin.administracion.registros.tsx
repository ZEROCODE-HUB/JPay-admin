import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TabLayout, type Tab } from "@/components/tab-layout";

export const Route = createFileRoute("/admin/administracion/registros")({
  component: Layout,
});

const tabs: Tab[] = [{ label: "Fondos por usuario", to: "/admin/administracion/registros" }];

function Layout() {
  return (
    <TabLayout tabs={tabs}>
      <Outlet />
    </TabLayout>
  );
}
