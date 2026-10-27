import { createFileRoute } from "@tanstack/react-router";
import { AlertasPage } from "@/features/alertas/listado/components/AlertasPage";

export const Route = createFileRoute("/admin/general/alertas/")({
  head: () => ({
    meta: [{ title: "Listado de alertas — Admin" }],
  }),
  component: AlertasPage,
});
