import { createFileRoute, Outlet } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/comercios/transferencia")({
  component: TransferenciaLayout,
  head: () => ({
    meta: [
      { title: pageTitle("Pagos con transferencia — Admin") },
      { name: "description", content: "Gestión de pagos con transferencia." },
    ],
  }),
});

function TransferenciaLayout() {
  return (
    <div className="space-y-4">
      <Outlet />
    </div>
  );
}
