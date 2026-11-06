import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { DepositosSinAsignarPage } from "@/features/cobros/components/DepositosSinAsignarPage";

export const Route = createFileRoute("/admin/cobros/sin-asignar")({
  component: DepositosSinAsignarPage,
  head: () => ({
    meta: [
      { title: pageTitle("Depósitos sin asignar — Admin") },
      { name: "description", content: "Depósitos SPEI que llegaron a una CLABE sin comercio." },
    ],
  }),
});
