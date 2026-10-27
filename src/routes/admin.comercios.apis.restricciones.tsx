import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { RestriccionesPage } from "@/features/apis/restricciones/components/RestriccionesPage";

export const Route = createFileRoute("/admin/comercios/apis/restricciones")({
  component: RestriccionesPage,
  head: () => ({
    meta: [{ title: pageTitle("APIs externas — Restricciones — Admin") }],
  }),
});
