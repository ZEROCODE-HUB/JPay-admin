import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { PruebasPage } from "@/features/pruebas/components/PruebasPage";

export const Route = createFileRoute("/admin/sistema/pruebas")({
  component: PruebasPage,
  head: () => ({
    meta: [
      { title: pageTitle("Herramientas de prueba — Admin") },
      { name: "description", content: "Simuladores y herramientas solo para pruebas." },
    ],
  }),
});
