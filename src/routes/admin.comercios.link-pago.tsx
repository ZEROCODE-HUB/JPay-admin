import { createFileRoute, Outlet } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { TabLayout, type Tab } from "@/components/tab-layout";

export const Route = createFileRoute("/admin/comercios/link-pago")({
  component: LinkPagoLayout,
  head: () => ({
    meta: [
      { title: pageTitle("Link de pago — Admin") },
      { name: "description", content: "Gestión del módulo de link de pago." },
    ],
  }),
});

const tabs: Tab[] = [
  { label: "Links de Pago", to: "/admin/comercios/link-pago" },
  // Acreditaciones, lotes, contracargos y adelantos de Payway (Argentina). En México Ecart Pay le
  // liquida directo al comercio: lo de JPay está en Comercios → Comisiones de JPay.
  { label: "Lotes de Acreditación", to: "/admin/comercios/link-pago/lotes", modulo: "payway" },
  { label: "Lotes de Venta", to: "/admin/comercios/link-pago/lotes-venta", modulo: "payway" },
  {
    label: "Calendario",
    to: "/admin/comercios/link-pago/calendario-acreditaciones",
    modulo: "payway",
  },
  { label: "Contracargos", to: "/admin/comercios/link-pago/contracargos", modulo: "payway" },
  { label: "Adelantos de Dinero", to: "/admin/comercios/link-pago/adelantos", modulo: "payway" },
  { label: "Resumen general", to: "/admin/comercios/link-pago/resumen", modulo: "payway" },
];

function LinkPagoLayout() {
  return (
    <TabLayout tabs={tabs}>
      <Outlet />
    </TabLayout>
  );
}
