import { createFileRoute } from "@tanstack/react-router";
import { MovimientosSubRoute } from "@/features/movimientos/subruta/components/MovimientosSubRoute";
import { brand, pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/general/movimientos/conversiones")({
  head: () => ({
    meta: [
      { title: pageTitle("Conversiones — Movimientos — Admin") },
      {
        name: "description",
        content: `Conversiones a dólares en la plataforma ${brand.shortName}.`,
      },
    ],
  }),
  component: () => (
    <MovimientosSubRoute
      titulo="Conversiones a dólares"
      descripcion="Conversiones de pesos a dólares de los comercios (los dos lados de cada conversión)."
      tipoCode="conversion"
    />
  ),
});
