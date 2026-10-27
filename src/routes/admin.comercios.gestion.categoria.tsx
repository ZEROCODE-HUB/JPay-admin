import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { CategoriaComercioPage } from "@/features/comercios/categoria/components/CategoriaComercioPage";

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
