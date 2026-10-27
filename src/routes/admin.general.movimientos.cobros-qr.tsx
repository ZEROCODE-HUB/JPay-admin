import { createFileRoute } from "@tanstack/react-router";
import { MovimientosSubRoute } from "@/features/movimientos/subruta/components/MovimientosSubRoute";
import { pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/general/movimientos/cobros-qr")({
  head: () => ({
    meta: [
      { title: pageTitle("Cobros QR — Movimientos — Admin") },
      { name: "description", content: "Cobros con QR (PCT) procesados por la plataforma." },
    ],
  }),
  component: () => (
    <MovimientosSubRoute
      titulo="Cobros QR"
      descripcion="Movimientos de cobro PCT (QR). El desglose comisión/neto del mock está disponible en el detalle de cada movimiento."
      tipoCode="cobro_pct"
    />
  ),
});
