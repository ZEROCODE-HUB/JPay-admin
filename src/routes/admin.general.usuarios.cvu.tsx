import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { CvuPage } from "@/features/usuarios/cvu/components/CvuPage";

export const Route = createFileRoute("/admin/general/usuarios/cvu")({
  head: () => ({
    meta: [
      { title: pageTitle("Usuarios con CVU — Usuarios — Admin") },
      { name: "description", content: "Usuarios con CVU (Cuenta Virtual) habilitada." },
    ],
  }),
  component: CvuPage,
});
