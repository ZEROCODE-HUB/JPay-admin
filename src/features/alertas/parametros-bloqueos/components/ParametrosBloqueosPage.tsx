import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/portal-shell";
import { useParametrosGenerales } from "../hooks/useParametrosGenerales";
import { useParametrosClientes } from "../hooks/useParametrosClientes";
import { SmvmCard } from "./SmvmCard";
import { ParametrosGeneralesCard } from "./ParametrosGeneralesCard";
import { ParametrosUsuariosCard } from "./ParametrosUsuariosCard";
import { ParametroClienteDialogs } from "./ParametroClienteDialogs";

export function ParametrosBloqueosPage() {
  const generales = useParametrosGenerales();
  const clientes = useParametrosClientes();

  return (
    <>
      <PageHeader
        title="Parámetros de bloqueos"
        description="Umbrales que activan bloqueo automático de cuenta hasta revisión de compliance"
      />

      <div className="bg-danger-50 border border-danger-500/20 rounded-lg p-4 mb-6 flex gap-3 max-w-2xl">
        <ShieldAlert size={18} className="text-danger-500 shrink-0 mt-0.5" />
        <div className="text-sm text-danger-600">
          <strong>Importante:</strong> Un <strong>bloqueo</strong> suspende la cuenta
          automáticamente al cumplirse el umbral. La cuenta queda bloqueada hasta que compliance la
          revise y la reactive manualmente.
        </div>
      </div>

      <SmvmCard />

      <ParametrosGeneralesCard g={generales} />

      <ParametrosUsuariosCard c={clientes} />

      <ParametroClienteDialogs c={clientes} generales={generales.generales} />
    </>
  );
}
