import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { AlertasPage } from "@/features/alertas/listado/components/AlertasPage";

export const Route = createFileRoute("/admin/general/alertas/")({
  head: () => ({ meta: [{ title: pageTitle("Listado de alertas — Admin") }] }),
  component: AlertasPage,
});
