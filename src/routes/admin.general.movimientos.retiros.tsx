import { createFileRoute } from "@tanstack/react-router";
import { MovimientosSubRoute } from "@/components/movimientos-subroute";
import { brand, pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/general/movimientos/retiros")({
  head: () => ({
    meta: [
      { title: pageTitle("Retiros — Movimientos — Admin") },
      {
        name: "description",
        content: `Retiros realizados desde la plataforma ${brand.shortName}.`,
      },
    ],
  }),
  component: () => (
    <MovimientosSubRoute
      titulo="Retiros"
      descripcion="Transacciones de retiro salidas de la plataforma."
      tipoCode="retiro"
    />
  ),
});
