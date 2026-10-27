import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { UsuariosPage } from "@/features/usuarios/listado/components/UsuariosPage";

export const Route = createFileRoute("/admin/general/usuarios/")({
  head: () => ({
    meta: [
      { title: pageTitle("Personas físicas — Usuarios — Admin") },
      { name: "description", content: "Gestión de personas físicas registradas en la plataforma." },
    ],
  }),
  component: UsuariosPage,
});
