import { useState } from "react";
import { toast } from "sonner";
import { BtnOutline } from "@/components/portal-shell";
import { avisarError } from "@/features/configuracion/paises/utils";
import { useCobreAdminMutaciones } from "@/hooks/useCobre";

/** Simulador de Cobre: el pagador paga un cobro por SPEI (CLABE dinámica, R2P). */
export function SimuladorPagoR2p({ habilitado }: { habilitado: boolean }) {
  const m = useCobreAdminMutaciones();
  const [clabe, setClabe] = useState("");

  const simular = () =>
    m.simularPagoR2p.mutate(clabe, {
      onSuccess: () => toast.success("Pago simulado enviado"),
      onError: avisarError,
    });

  return (
    <div>
      <p className="text-xs font-medium">Simular el pago de un cobro por SPEI (CLABE dinámica)</p>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <input
          className="h-9 w-56 rounded-md border border-input bg-card px-2 text-sm font-mono"
          placeholder="CLABE del cobro"
          value={clabe}
          onChange={(e) => setClabe(e.target.value.replace(/\D/g, ""))}
        />
        <BtnOutline disabled={!habilitado || m.simularPagoR2p.isPending} onClick={simular}>
          {m.simularPagoR2p.isPending ? "Pagando…" : "Simular pago"}
        </BtnOutline>
      </div>
    </div>
  );
}
