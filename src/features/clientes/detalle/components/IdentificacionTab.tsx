import type { Cliente } from "@/lib/api/types";
import type { ClienteDetalleData } from "../hooks/useClienteDetalle";
import { camposIdentificacion } from "../utils";
import { FieldGrid } from "./FieldGrid";
import { KpiCard } from "./KpiCard";
import { SectionCard } from "./SectionCard";
import { InfoTip } from "@/shared/ui/info-tip";

export function IdentificacionTab({
  cliente,
  data,
}: {
  cliente: Cliente;
  data: ClienteDetalleData;
}) {
  const { subcuentasQuery, comisionesQuery, documentosResumenQuery } = data;

  const { personal: personalRaw, compliance } = camposIdentificacion(cliente);
  const cuentasCount = subcuentasQuery.isLoading ? "…" : String(subcuentasQuery.data?.length ?? 0);
  const personal = personalRaw.map((p) =>
    p.label === "Cant. subcuentas" ? { ...p, valor: cuentasCount } : p,
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SectionCard title="Resumen de productos">
          <ul className="space-y-1.5">
            <li className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                Subcuentas{" "}
                <InfoTip>Todas las subcuentas (CLABE) del cliente, activas o pausadas.</InfoTip>
              </span>
              <span className="font-semibold tabular-nums">
                {subcuentasQuery.data?.length ?? "—"}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                Comisiones{" "}
                <InfoTip>
                  Reglas de comisión configuradas para el cliente, de cualquier tipo de operación y
                  estado. No son comisiones cobradas.
                </InfoTip>
              </span>
              <span className="font-semibold tabular-nums">
                {comisionesQuery.data ? comisionesQuery.data.length : "—"}
              </span>
            </li>
          </ul>
        </SectionCard>

        <KpiCard
          label="Documentos cargados"
          info="Documentos del expediente que se subieron para este cliente, en cualquier estado de revisión."
          value={String(documentosResumenQuery.data?.length ?? 0)}
        />
        <KpiCard
          label="PEP"
          info="Si el cliente declaró ser Persona Políticamente Expuesta en su alta. «—» significa que no lo informó."
          value={compliance.find((c) => c.label === "PEP")?.valor ?? "No"}
          tone="muted"
        />
      </div>

      <SectionCard title="Identificación">
        <FieldGrid campos={personal} />
      </SectionCard>
    </>
  );
}
