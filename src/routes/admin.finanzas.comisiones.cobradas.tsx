import { createFileRoute } from "@tanstack/react-router";
import { brand, pageTitle } from "@/brand/brand";
import { ComisionesCobradasPage } from "@/features/finanzas/comisiones/components/ComisionesCobradasPage";

export const Route = createFileRoute("/admin/finanzas/comisiones/cobradas")({
  component: ComisionesCobradasPage,
  head: () => ({
    meta: [
      { title: pageTitle("Comisiones cobradas — Admin") },
      { name: "description", content: `Comisiones cobradas por la plataforma ${brand.shortName}.` },
    ],
  }),
});
