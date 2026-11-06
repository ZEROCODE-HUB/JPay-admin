import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { ConciliacionCard } from "@/features/control/components/ConciliacionCard";

export const Route = createFileRoute("/admin/control/conciliacion/cobre")({
  component: ConciliacionCobre,
  head: () => ({ meta: [{ title: pageTitle("Conciliación con Cobre — Admin") }] }),
});

function ConciliacionCobre() {
  return (
    <ConciliacionCard
      proveedor="cobre"
      nombre="Cobre"
      descripcion="Todos los días se cruzan las transacciones de las cuentas en Cobre (últimos 3 días) con los depósitos y transferencias de JPay, y el saldo en Cobre con el del ledger. Los depósitos que no llegaron por aviso se acreditan en ese momento."
    />
  );
}
