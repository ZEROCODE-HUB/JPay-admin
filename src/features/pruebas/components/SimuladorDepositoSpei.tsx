import { useState } from "react";
import { toast } from "sonner";
import { BtnOutline } from "@/components/portal-shell";
import { avisarError } from "@/features/configuracion/paises/utils";
import { useCobreAdminMutaciones } from "@/hooks/useCobre";
import { parseMonto } from "@/shared/format";

/** Simulador de Cobre: transferencia SPEI entrante a la CLABE de un comercio. */
export function SimuladorDepositoSpei({ habilitado }: { habilitado: boolean }) {
  const m = useCobreAdminMutaciones();
  const [dep, setDep] = useState({ clabe: "", monto: "" });

  const simular = () =>
    m.simularDeposito.mutate(
      { clabe: dep.clabe, monto: parseMonto(dep.monto) },
      { onSuccess: () => toast.success("Depósito simulado enviado"), onError: avisarError },
    );

  return (
    <div>
      <p className="text-xs font-medium">Simular un depósito SPEI a la CLABE de un comercio</p>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <input
          className="h-9 w-56 rounded-md border border-input bg-card px-2 text-sm font-mono"
          placeholder="CLABE del comercio"
          value={dep.clabe}
          onChange={(e) => setDep({ ...dep, clabe: e.target.value.replace(/\D/g, "") })}
        />
        <input
          className="h-9 w-32 rounded-md border border-input bg-card px-2 text-sm"
          placeholder="Monto"
          inputMode="decimal"
          value={dep.monto}
          onChange={(e) => setDep({ ...dep, monto: e.target.value })}
        />
        <BtnOutline disabled={!habilitado || m.simularDeposito.isPending} onClick={simular}>
          {m.simularDeposito.isPending ? "Enviando…" : "Simular depósito"}
        </BtnOutline>
      </div>
    </div>
  );
}
