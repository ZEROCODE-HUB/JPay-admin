import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { PageHeader } from "@/components/portal-shell";
import { ContracargosCard } from "@/features/control/components/ContracargosCard";
import { ReembolsosVerificacionCard } from "@/features/control/components/ReembolsosVerificacionCard";

export const Route = createFileRoute("/admin/control/disputas")({
  component: DisputasPage,
  head: () => ({
    meta: [
      { title: pageTitle("Contracargos y reembolsos — Admin") },
      {
        name: "description",
        content: "Contracargos de Ecart Pay y reembolsos que esperan verificación.",
      },
    ],
  }),
});

function DisputasPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Contracargos y reembolsos"
        description="Contracargos que abrieron los bancos en Ecart Pay y reembolsos que hay que verificar."
      />
      <ContracargosCard />
      <ReembolsosVerificacionCard />
    </div>
  );
}
