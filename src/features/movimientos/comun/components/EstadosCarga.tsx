import { AlertTriangle } from "lucide-react";
import { DataAccessError } from "@/lib/api/errors";

/** Spinner de carga de la grilla de movimientos. */
export function CargandoMovimientos({ texto }: { texto: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
      <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
      {texto}
    </div>
  );
}

/** Error de carga de la grilla de movimientos (distingue falta de permiso). */
export function ErrorMovimientos({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const err = error instanceof DataAccessError ? error : null;
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger-200 bg-danger-50 px-6 py-12 text-center text-sm text-danger-700">
      <AlertTriangle size={28} />
      <div>
        <p className="font-semibold">
          {err?.permission
            ? "No tenés permiso para ver esto"
            : "Ocurrió un error al cargar los movimientos"}
        </p>
        <p className="mt-1">{err?.message ?? "Error desconocido"}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
      >
        Reintentar
      </button>
    </div>
  );
}
