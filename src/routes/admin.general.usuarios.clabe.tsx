import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { ClabePage } from "@/features/usuarios/clabe/components/ClabePage";

export const Route = createFileRoute("/admin/general/usuarios/clabe")({
  head: () => ({
    meta: [
      { title: pageTitle("Usuarios con CLABE — Usuarios — Admin") },
      { name: "description", content: "Subcuentas con su CLABE asignada por Cobre." },
    ],
  }),
  component: ClabePage,
});
