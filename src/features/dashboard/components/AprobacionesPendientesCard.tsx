import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/portal-shell";
import { useAprobacionesCobre } from "@/hooks/useCobre";
import { formatNumber } from "@/shared/format";

/** Envíos (transferencias y lotes) que esperan la aprobación de un admin. */
export function AprobacionesPendientesCard() {
  const { aprobaciones, lotes } = useAprobacionesCobre();
  const cargando = aprobaciones.isLoading || lotes.isLoading;
  const error = aprobaciones.isError || lotes.isError;
  const envios = aprobaciones.data?.length ?? 0;
  const enLotes = lotes.data?.length ?? 0;
  const total = envios + enLotes;
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Envíos por aprobar
        </h3>
        <Link
          to="/admin/envios/aprobaciones"
          className="text-xs text-primary-ink font-semibold inline-flex items-center gap-1"
        >
          Aprobaciones pendientes <ArrowUpRight size={12} />
        </Link>
      </div>
      <Card className="p-4 mb-6">
        {cargando || error ? (
          <p className="text-sm text-muted-foreground">
            {cargando ? "Cargando…" : "No se pudo cargar."}
          </p>
        ) : total === 0 ? (
          <p className="text-sm text-muted-foreground">No hay envíos esperando aprobación.</p>
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-xl md:text-2xl font-semibold text-foreground tabular-nums">
              {formatNumber(total)}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatNumber(envios)} {envios === 1 ? "transferencia" : "transferencias"} y{" "}
              {formatNumber(enLotes)} {enLotes === 1 ? "lote" : "lotes"} esperan a un admin.
            </span>
          </div>
        )}
      </Card>
    </>
  );
}
