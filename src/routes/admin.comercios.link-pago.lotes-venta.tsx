import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { LotesVentaPage } from "@/features/link-pago/lotes-venta/components/LotesVentaPage";

export const Route = createFileRoute("/admin/comercios/link-pago/lotes-venta")({
  component: LotesVentaPage,
  head: () => ({
    meta: [
      { title: pageTitle("Lotes de Venta — Links de Pago — Admin") },
      {
        name: "description",
        content: "Venta bruta acumulada del día por comercio, bandera y fecha (v_lotes_venta).",
      },
    ],
  }),
});
