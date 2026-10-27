import { createFileRoute } from "@tanstack/react-router";
import { BloqueosPage } from "@/features/alertas/bloqueos/components/BloqueosPage";

export const Route = createFileRoute("/admin/general/alertas/bloqueos")({
  head: () => ({ meta: [{ title: "Listado de bloqueos — Admin Panel" }] }),
  component: BloqueosPage,
});
