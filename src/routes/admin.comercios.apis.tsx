import { createFileRoute, Outlet } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { TabLayout, type Tab } from "@/components/tab-layout";

export const Route = createFileRoute("/admin/comercios/apis")({
  component: Layout,
  head: () => ({
    meta: [
      { title: pageTitle("APIs externas — Admin") },
      { name: "description", content: "Integraciones con APIs externas de la plataforma." },
    ],
  }),
});

const tabs: Tab[] = [
  { label: "Usuarios", to: "/admin/comercios/apis" },
  { label: "Endpoints", to: "/admin/comercios/apis/endpoints" },
  { label: "Restricciones", to: "/admin/comercios/apis/restricciones" },
  { label: "Resolvers", to: "/admin/comercios/apis/resolvers" },
];

function Layout() {
  return (
    <TabLayout tabs={tabs}>
      <Outlet />
    </TabLayout>
  );
}
