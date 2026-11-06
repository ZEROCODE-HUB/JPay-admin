import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { BloqueosPage } from "@/features/alertas/bloqueos/components/BloqueosPage";

export const Route = createFileRoute("/admin/general/alertas/bloqueos")({
  head: () => ({ meta: [{ title: pageTitle("Listado de bloqueos — Admin") }] }),
  component: BloqueosPage,
});
