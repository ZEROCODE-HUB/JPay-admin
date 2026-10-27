import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { pageTitle } from "@/brand/brand";
import { MovimientosPage } from "@/features/movimientos/listado/components/MovimientosPage";

export const Route = createFileRoute("/admin/general/movimientos/")({
  validateSearch: z.object({ legajo: z.string().optional(), txid: z.string().optional() }),
  head: () => ({
    meta: [
      { title: pageTitle("Todos los movimientos — Movimientos — Admin") },
      {
        name: "description",
        content: "Movimientos por concepto (ingreso, comisión, impuesto) desde el ledger.",
      },
    ],
  }),
  component: TodosPage,
});

function TodosPage() {
  const { legajo, txid } = Route.useSearch();
  return <MovimientosPage legajo={legajo} txidUrl={txid} />;
}
