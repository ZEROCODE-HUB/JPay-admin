import { createFileRoute } from "@tanstack/react-router";
import { ImpuestosBanner } from "@/features/movimientos/subruta/components/ImpuestosBanner";
import { MovimientosSubRoute } from "@/features/movimientos/subruta/components/MovimientosSubRoute";
import { brand, pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/general/movimientos/impuestos")({
  head: () => ({
    meta: [
      { title: pageTitle("Impuestos cobrados — Movimientos — Admin") },
      {
        name: "description",
        content: `Impuestos cobrados a través de la plataforma ${brand.shortName}.`,
      },
    ],
  }),
  component: ImpuestosPage,
});

function ImpuestosPage() {
  return (
    <>
      <ImpuestosBanner />
      <MovimientosSubRoute
        titulo="Impuestos cobrados"
        descripcion="Retenciones impositivas al cliente registradas en la columna impuesto de cada movimiento (todos los tipos)."
        soloConImpuesto
      />
    </>
  );
}
