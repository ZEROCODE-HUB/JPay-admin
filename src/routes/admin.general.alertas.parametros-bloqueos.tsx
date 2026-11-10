import { createFileRoute } from "@tanstack/react-router";
import { ParametrosBloqueosPage } from "@/features/alertas/parametros-bloqueos/components/ParametrosBloqueosPage";

export const Route = createFileRoute("/admin/general/alertas/parametros-bloqueos")({
  head: () => ({ meta: [{ title: "Parámetros de bloqueos — Admin Panel" }] }),
  component: ParametrosBloqueosPage,
});
