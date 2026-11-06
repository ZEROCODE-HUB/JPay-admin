import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TabLayout, type Tab } from "@/components/tab-layout";
import { brand, pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/general/usuarios")({
  head: () => ({
    meta: [
      { title: pageTitle("Clientes — Admin") },
      { name: "description", content: `Gestión de clientes de la plataforma ${brand.shortName}.` },
    ],
  }),
  component: UsuariosLayout,
});

const tabs: Tab[] = [
  { label: "Personas físicas", to: "/admin/general/usuarios" },
  { label: "Personas morales", to: "/admin/general/usuarios/juridicas" },
  { label: "Usuarios con CLABE", to: "/admin/general/usuarios/clabe" },
];

function UsuariosLayout() {
  return (
    <TabLayout tabs={tabs}>
      <Outlet />
    </TabLayout>
  );
}
