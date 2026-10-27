import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ArrowLeftRight, Banknote } from "lucide-react";
import { Input, BtnPrimary, PageHeader } from "@/components/portal-shell";
import { EmptyState } from "@/shared/ui/empty-state";

type QueryType = "deposito" | "retiro";

export const Route = createFileRoute("/admin/administracion/soporte/")({
  head: () => ({ meta: [{ title: "Consultas frecuentes — Admin Panel" }] }),
  component: Page,
});

function Page() {
  const [tipo, setTipo] = useState<QueryType>("deposito");
  const [id, setId] = useState("");
  // La consulta a Coelsa todavía no está conectada (antes devolvía un resultado
  // inventado). Se guarda el último ID consultado para mostrar el estado vacío.
  const [consultado, setConsultado] = useState<{ id: string; tipo: QueryType } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const consultar = () => {
    if (!id.trim()) {
      setError("Ingresá un ID de Coelsa");
      setConsultado(null);
      return;
    }
    setError(null);
    setConsultado({ id: id.trim(), tipo });
  };

  return (
    <>
      <PageHeader
        title="Consultas frecuentes"
        description="Consultá depósitos y retiros por ID de Coelsa"
      />

      <div className="bg-card border rounded-lg p-5 space-y-4 max-w-2xl">
        <div className="inline-flex p-1 rounded-lg bg-muted text-sm font-medium">
          <button
            type="button"
            onClick={() => setTipo("deposito")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              tipo === "deposito"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Banknote size={16} /> Depósito
          </button>
          <button
            type="button"
            onClick={() => setTipo("retiro")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              tipo === "retiro"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowLeftRight size={16} /> Retiro
          </button>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              ID de Coelsa
            </label>
            <Input
              placeholder={tipo === "deposito" ? "Ej: COE-1293" : "Ej: COE-8841"}
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && consultar()}
            />
          </div>
          <BtnPrimary onClick={consultar}>
            <Search size={16} />
            Consultar
          </BtnPrimary>
        </div>

        {error && <p className="text-sm text-danger-600">{error}</p>}
      </div>

      {consultado && (
        <div className="bg-card border rounded-lg">
          <EmptyState
            title="Sin datos"
            description={`La consulta de ${consultado.tipo === "deposito" ? "depósitos" : "retiros"} por ID de Coelsa (${consultado.id}) todavía no está conectada.`}
          />
        </div>
      )}
    </>
  );
}
