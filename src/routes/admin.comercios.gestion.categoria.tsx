import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { CategoriaComercioPage } from "@/components/categoria-comercio-page";

export const Route = createFileRoute("/admin/comercios/gestion/categoria")({
  component: CategoriaComercioPage,
  head: () => ({
    meta: [
      { title: pageTitle("Códigos de categoría — Admin") },
      {
        name: "description",
        content: "Administración de códigos de categoría para comercios.",
      },
    ],
  }),
});
