import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { JuridicasPage } from "@/features/usuarios/juridicas/components/JuridicasPage";

export const Route = createFileRoute("/admin/general/usuarios/juridicas")({
  head: () => ({
    meta: [
      { title: pageTitle("Personas jurídicas — Usuarios — Admin") },
      {
        name: "description",
        content: "Gestión de personas jurídicas registradas en la plataforma.",
      },
    ],
  }),
  component: JuridicasPage,
});
