import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { ParametrosAlertasPage } from "@/features/alertas/parametros-alertas/components/ParametrosAlertasPage";

export const Route = createFileRoute("/admin/general/alertas/parametros-alertas")({
  head: () => ({ meta: [{ title: pageTitle("Parámetros de alertas — Admin") }] }),
  component: ParametrosAlertasPage,
});
