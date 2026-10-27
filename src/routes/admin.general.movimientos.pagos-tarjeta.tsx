import { createFileRoute } from "@tanstack/react-router";
import { MovimientosSubRoute } from "@/features/movimientos/subruta/components/MovimientosSubRoute";
import { pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/general/movimientos/pagos-tarjeta")({
  head: () => ({
    meta: [
      { title: pageTitle("Pagos con tarjeta — Movimientos — Admin") },
      { name: "description", content: "Pagos con tarjeta procesados por la plataforma." },
    ],
  }),
  component: () => (
    <MovimientosSubRoute
      titulo="Pagos con tarjeta"
      descripcion="Movimientos de pago con tarjeta. Los campos medio de pago y cuotas del mock no existen en la tabla movimientos."
      tipoCode="tarjeta"
    />
  ),
});
