import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { CargaComisionesPage } from "@/features/finanzas/comisiones/components/CargaComisionesPage";

export const Route = createFileRoute("/admin/finanzas/comisiones/carga")({
  component: CargaComisionesPage,
  head: () => ({
    meta: [
      { title: pageTitle("Carga de comisiones — Admin") },
      { name: "description", content: "Comisiones que JPay le cobra a cada cliente." },
    ],
  }),
});
