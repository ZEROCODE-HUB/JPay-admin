import { createFileRoute, Outlet } from "@tanstack/react-router";
import { brand, pageTitle } from "@/brand/brand";
import { TabLayout, type Tab } from "@/components/tab-layout";

export const Route = createFileRoute("/admin/comercios/gestion")({
  component: GestionLayout,
  head: () => ({
    meta: [
      { title: pageTitle("Gestión — Admin") },
      { name: "description", content: `Gestión de comercios de la plataforma ${brand.shortName}.` },
    ],
  }),
});

const tabs: Tab[] = [
  { label: "Comercios", to: "/admin/comercios/gestion" },
  { label: "Códigos de categoría", to: "/admin/comercios/gestion/categoria" },
  { label: "Métodos de pago", to: "/admin/comercios/gestion/metodos-pago" },
];

function GestionLayout() {
  return (
    <div className="space-y-4">
      <TabLayout tabs={tabs}>
        <Outlet />
      </TabLayout>
    </div>
  );
}
