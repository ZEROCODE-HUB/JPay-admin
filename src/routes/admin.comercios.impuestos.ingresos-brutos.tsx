import { createFileRoute, Outlet } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/comercios/impuestos/ingresos-brutos")({
  component: Layout,
  head: () => ({
    meta: [{ title: pageTitle("Ingresos Brutos — Admin") }],
  }),
});

function Layout() {
  return (
    <div className="space-y-4">
      <Outlet />
    </div>
  );
}
