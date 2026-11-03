import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TabLayout, type Tab } from "@/components/tab-layout";
import { brand, pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/general/movimientos")({
  head: () => ({
    meta: [
      { title: pageTitle("Movimientos — Admin") },
      {
        name: "description",
        content: `Historial de movimientos de la plataforma ${brand.shortName}.`,
      },
    ],
  }),
  component: MovimientosLayout,
});

const tabs: Tab[] = [
  { label: "Todos los movimientos", to: "/admin/general/movimientos" },
  { label: "Depósitos", to: "/admin/general/movimientos/depositos" },
  {
    label: "Retiros",
    to: "/admin/general/movimientos/retiros",
    modulo: "transferencias_salientes",
  },
  {
    label: "Transferencias",
    to: "/admin/general/movimientos/transferencias",
    modulo: "transferencias_cobre",
  },
  {
    label: "Conversiones a dólares",
    to: "/admin/general/movimientos/conversiones",
    modulo: "transferencias_cobre",
  },
  { label: "Cobro de comisiones", to: "/admin/general/movimientos/comisiones" },
  { label: "Impuestos cobrados", to: "/admin/general/movimientos/impuestos", modulo: "iibb" },
  {
    label: "Pagos con tarjeta",
    to: "/admin/general/movimientos/pagos-tarjeta",
    modulo: "payway",
  },
  { label: "Pagos QR", to: "/admin/general/movimientos/pagos-qr", modulo: "qr" },
  { label: "Cobros QR", to: "/admin/general/movimientos/cobros-qr", modulo: "qr" },
];

function MovimientosLayout() {
  return (
    <TabLayout tabs={tabs}>
      <Outlet />
    </TabLayout>
  );
}
