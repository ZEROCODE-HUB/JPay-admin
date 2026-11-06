import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { IngresosJpayPage } from "@/features/finanzas/comisiones/components/IngresosJpayPage";

export const Route = createFileRoute("/admin/finanzas/comisiones/")({
  component: IngresosJpayPage,
  head: () => ({ meta: [{ title: pageTitle("Comisiones de JPay — Admin") }] }),
});
