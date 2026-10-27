import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { ConfiguracionPage } from "@/features/configuracion/components/ConfiguracionPage";

export const Route = createFileRoute("/admin/configuracion/")({
  component: ConfiguracionPage,
  head: () => ({
    meta: [
      { title: pageTitle("Gestor de Integraciones — Admin") },
      { name: "description", content: "Estado y gestión de las integraciones de la plataforma." },
    ],
  }),
});
