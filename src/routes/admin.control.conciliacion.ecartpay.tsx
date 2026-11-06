import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { ConciliacionCard } from "@/features/control/components/ConciliacionCard";

export const Route = createFileRoute("/admin/control/conciliacion/ecartpay")({
  component: ConciliacionEcartPay,
  head: () => ({ meta: [{ title: pageTitle("Conciliación con Ecart Pay — Admin") }] }),
});

function ConciliacionEcartPay() {
  return (
    <ConciliacionCard
      proveedor="ecartpay"
      nombre="Ecart Pay"
      descripcion="Todos los días se comparan los pagos de JPay con las transacciones de cada comercio (últimos 3 días). También guarda la comisión y el neto de Ecart Pay en cada pago."
    />
  );
}
