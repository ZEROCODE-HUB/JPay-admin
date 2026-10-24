import { createFileRoute } from "@tanstack/react-router";
import { MovimientosSubRoute } from "@/components/movimientos-subroute";
import { brand, pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/general/movimientos/depositos")({
  head: () => ({
    meta: [
      { title: pageTitle("Depósitos — Movimientos — Admin") },
      { name: "description", content: `Depósitos realizados en la plataforma ${brand.shortName}.` },
    ],
  }),
  component: () => (
    <MovimientosSubRoute
      titulo="Depósitos"
      descripcion="Transacciones de depósito ingresadas a la plataforma."
      tipoCode="deposito"
    />
  ),
});
