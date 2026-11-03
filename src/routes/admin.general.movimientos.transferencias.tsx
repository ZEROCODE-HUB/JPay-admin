import { createFileRoute } from "@tanstack/react-router";
import { MovimientosSubRoute } from "@/features/movimientos/subruta/components/MovimientosSubRoute";
import { brand, pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/general/movimientos/transferencias")({
  head: () => ({
    meta: [
      { title: pageTitle("Transferencias — Movimientos — Admin") },
      { name: "description", content: `Transferencias en la plataforma ${brand.shortName}.` },
    ],
  }),
  component: () => (
    <MovimientosSubRoute
      titulo="Transferencias"
      descripcion="Transferencias SPEI y envíos en dólares (Fedwire / SWIFT) de los comercios."
      tipoCode="transferencia"
    />
  ),
});
