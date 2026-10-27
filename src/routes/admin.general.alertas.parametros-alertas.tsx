import { createFileRoute } from "@tanstack/react-router";
import { ParametrosAlertasPage } from "@/features/alertas/parametros-alertas/components/ParametrosAlertasPage";

export const Route = createFileRoute("/admin/general/alertas/parametros-alertas")({
  head: () => ({ meta: [{ title: "Parámetros de alertas — Admin Panel" }] }),
  component: ParametrosAlertasPage,
});
