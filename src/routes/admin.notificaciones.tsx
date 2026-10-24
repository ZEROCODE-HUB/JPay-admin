import { createFileRoute, Outlet } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/notificaciones")({
  component: NotificacionesLayout,
  head: () => ({
    meta: [
      { title: pageTitle("Sistema de Notificaciones — Admin") },
      { name: "description", content: "Centro de notificaciones del sistema." },
    ],
  }),
});

function NotificacionesLayout() {
  return <Outlet />;
}
