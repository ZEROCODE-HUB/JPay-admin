import { createFileRoute, Outlet } from "@tanstack/react-router";
import { brand, pageTitle } from "@/brand/brand";
import { ComerciosProvider } from "@/contexts/comercios";

export const Route = createFileRoute("/admin/comercios")({
  component: ComerciosLayout,
  head: () => ({
    meta: [
      { title: pageTitle("Comercios — Admin") },
      { name: "description", content: `Gestión de comercios de la plataforma ${brand.name}.` },
    ],
  }),
});

function ComerciosLayout() {
  return (
    <ComerciosProvider>
      <Outlet />
    </ComerciosProvider>
  );
}
