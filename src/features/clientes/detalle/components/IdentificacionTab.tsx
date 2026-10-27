import { Ban } from "lucide-react";
import type { Cliente } from "@/lib/api/types";
import type { ClienteDetalleData } from "../hooks/useClienteDetalle";
import type { ClienteDetalleUi } from "../hooks/useClienteDetalleUi";
import { camposIdentificacion } from "../utils";
import { FieldGrid } from "./FieldGrid";
import { KpiCard } from "./KpiCard";
import { SectionCard } from "./SectionCard";

export function IdentificacionTab({
  cliente,
  data,
  ui,
}: {
  cliente: Cliente;
  data: ClienteDetalleData;
  ui: ClienteDetalleUi;
}) {
  const {
    subcuentasQuery,
    comisionesQuery,
    impuestosQuery,
    documentosResumenQuery,
    validacionesQuery,
  } = data;
  const { setExencionOpen } = ui;

  const { personal: personalRaw, compliance } = camposIdentificacion(cliente);
  const cuentasCount = subcuentasQuery.isLoading ? "…" : String(subcuentasQuery.data?.length ?? 0);
  const personal = personalRaw.map((p) =>
    p.label === "Cant. cuentas bancarias" || p.label === "Cant. cuentas virtuales"
      ? { ...p, valor: cuentasCount }
      : p,
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SectionCard title="Resumen de productos">
          <ul className="space-y-1.5">
            <li className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Cuentas bancarias</span>
              <span className="font-semibold tabular-nums">
                {subcuentasQuery.data ? subcuentasQuery.data.length : "—"}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">CVUs</span>
              <span className="font-semibold tabular-nums">
                {subcuentasQuery.data?.length ?? "—"}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Comisiones</span>
              <span className="font-semibold tabular-nums">
                {comisionesQuery.data ? comisionesQuery.data.length : "—"}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Impuestos</span>
              <span className="font-semibold tabular-nums">{impuestosQuery.rows.length}</span>
            </li>
          </ul>
        </SectionCard>

        <KpiCard
          label="Documentos cargados"
          value={String(documentosResumenQuery.data?.length ?? 0)}
        />
        <KpiCard
          label="Validaciones auto KYC"
          value={String(validacionesQuery.data?.length ?? 0)}
        />
        <KpiCard
          label="PEP"
          value={compliance.find((c) => c.label === "PEP")?.valor ?? "No"}
          tone="muted"
        />
      </div>

      <SectionCard
        title="Identificación"
        actions={
          <button
            type="button"
            onClick={() => setExencionOpen(true)}
            className="inline-flex items-center gap-1.5 h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
          >
            <Ban size={13} /> Eximir créditos
          </button>
        }
      >
        <FieldGrid campos={personal} />
      </SectionCard>
    </>
  );
}
