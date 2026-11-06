import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { ParametrosBloqueosPage } from "@/features/alertas/parametros-bloqueos/components/ParametrosBloqueosPage";

export const Route = createFileRoute("/admin/general/alertas/parametros-bloqueos")({
  head: () => ({ meta: [{ title: pageTitle("Parámetros de bloqueos — Admin") }] }),
  component: ParametrosBloqueosPage,
});
