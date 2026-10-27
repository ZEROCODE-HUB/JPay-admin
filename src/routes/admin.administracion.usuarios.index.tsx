import { createFileRoute } from "@tanstack/react-router";
import { AdminUsersPage } from "@/features/administracion/usuarios/components/AdminUsersPage";

export const Route = createFileRoute("/admin/administracion/usuarios/")({
  head: () => ({ meta: [{ title: "Administración de personal — Admin Panel" }] }),
  component: AdminUsersPage,
});
