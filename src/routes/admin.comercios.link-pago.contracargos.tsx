import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { ContracargosPage } from "@/features/link-pago/contracargos/components/ContracargosPage";

export const Route = createFileRoute("/admin/comercios/link-pago/contracargos")({
  component: ContracargosPage,
  head: () => ({
    meta: [
      { title: pageTitle("Contracargos — Links de Pago — Admin") },
      { name: "description", content: "Gestión de contracargos de links de pago." },
    ],
  }),
});
