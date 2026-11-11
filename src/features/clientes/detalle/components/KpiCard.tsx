import type { ReactNode } from "react";
import { Cargando } from "@/shared/ui/estado-carga";
import { EtiquetaConInfo } from "@/shared/ui/info-tip";

export function KpiCard({
  label,
  value,
  tone,
  info,
  loading = false,
}: {
  label: string;
  value: string;
  tone?: "default" | "muted";
  /** De dónde sale el dato; se muestra con una «i» al pasar el mouse. */
  info?: ReactNode;
  /** Mientras carga: gris animado en vez de un 0. */
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <EtiquetaConInfo label={label} info={info} />
      </p>
      <p
        className={`mt-2 text-2xl font-semibold tabular-nums ${
          tone === "muted" ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {loading ? <Cargando className="h-7 w-16" /> : value}
      </p>
    </div>
  );
}
