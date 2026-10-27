import { createFileRoute } from "@tanstack/react-router";
import { brand, pageTitle } from "@/brand/brand";
import { LotesPage } from "@/features/link-pago/lotes/components/LotesPage";

export const Route = createFileRoute("/admin/comercios/link-pago/lotes")({
  component: LotesPage,
  head: () => ({
    meta: [
      { title: pageTitle("Lotes de Acreditación — Links de Pago — Admin") },
      {
        name: "description",
        content: `Lotes generados por ${brand.name} para acreditar pagos a comercios.`,
      },
    ],
  }),
});
