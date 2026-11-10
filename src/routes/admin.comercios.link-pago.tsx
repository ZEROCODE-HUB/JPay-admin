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

const tabs: Tab[] = [{ label: "Links de Pago", to: "/admin/comercios/link-pago" }];

function LinkPagoLayout() {
  return (
    <TabLayout tabs={tabs}>
      <Outlet />
    </TabLayout>
  );
}
