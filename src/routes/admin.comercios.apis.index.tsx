import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { UsuariosApiPage } from "@/features/apis/usuarios/components/UsuariosApiPage";

export const Route = createFileRoute("/admin/comercios/apis/")({
  component: UsuariosApiPage,
  head: () => ({
    meta: [{ title: pageTitle("APIs externas — Usuarios — Admin") }],
  }),
});
