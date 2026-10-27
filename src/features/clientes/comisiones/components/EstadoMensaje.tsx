import { AlertTriangle, Inbox } from "lucide-react";
import { BtnPrimary } from "@/components/portal-shell";

/** Estados del listado de comisiones: sin permiso, error de carga o sin resultados. */
export function EstadoMensaje({
  tipo,
  mensaje,
  onRetry,
}: {
  tipo: "error" | "vacio" | "permiso";
  mensaje: string;
  onRetry?: () => void;
}) {
  if (tipo === "permiso") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-6 py-12 text-center text-sm text-amber-800">
        <AlertTriangle size={28} />
        <div>
          <p className="font-semibold">No tenés permiso para ver esto</p>
          <p className="mt-1">{mensaje}</p>
        </div>
      </div>
    );
  }
  if (tipo === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger-200 bg-danger-50 px-6 py-12 text-center text-sm text-danger-700">
        <AlertTriangle size={28} />
        <div>
          <p className="font-semibold">Ocurrió un error al cargar las comisiones</p>
          <p className="mt-1">{mensaje}</p>
        </div>
        {onRetry && (
          <BtnPrimary onClick={onRetry} className="mt-2">
            Reintentar
          </BtnPrimary>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
      <Inbox size={28} />
      <p>No hay comisiones que coincidan con los filtros aplicados.</p>
    </div>
  );
}
