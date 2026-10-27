import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { MetodosPagoPage } from "@/features/comercios/metodos-pago/components/MetodosPagoPage";

export const Route = createFileRoute("/admin/comercios/gestion/metodos-pago")({
  component: MetodosPagoPage,
  head: () => ({
    meta: [
      { title: pageTitle("Métodos de pago — Gestión — Admin") },
      { name: "description", content: "Gestión de métodos de pago para comercios." },
    ],
  }),
});
