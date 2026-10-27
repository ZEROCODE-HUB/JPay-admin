import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { CalendarioPage } from "@/features/link-pago/calendario/components/CalendarioPage";

export const Route = createFileRoute("/admin/comercios/link-pago/calendario-acreditaciones")({
  component: CalendarioPage,
  head: () => ({
    meta: [
      { title: pageTitle("Calendario de Acreditaciones — Links de Pago — Admin") },
      {
        name: "description",
        content:
          "Vista calendarizada de cuándo se acreditarán los lotes con KPIs de saldos y adelantos.",
      },
    ],
  }),
});
