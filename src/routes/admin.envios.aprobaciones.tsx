import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { AprobacionesPendientesPage } from "@/features/envios/components/AprobacionesPendientesPage";

export const Route = createFileRoute("/admin/envios/aprobaciones")({
  component: AprobacionesPendientesPage,
  head: () => ({
    meta: [
      { title: pageTitle("Aprobaciones pendientes — Admin") },
      { name: "description", content: "Envíos y lotes que esperan la aprobación de un admin." },
    ],
  }),
});
