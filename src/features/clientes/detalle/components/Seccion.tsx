import { AlertTriangle, Inbox } from "lucide-react";
import { DataAccessError } from "@/lib/api/errors";

export function Seccion({
  titulo,
  loading,
  error,
  onRetry,
  vacio,
  children,
}: {
  titulo: string;
  loading: boolean;
  error: Error | null;
  onRetry?: () => void;
  vacio: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-semibold text-foreground mb-3">{titulo}</h2>
      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-card py-10 text-sm text-muted-foreground">
          <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
          Cargando…
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-6 py-8 text-center text-sm text-danger-700">
          <AlertTriangle size={22} />
          <p>{error instanceof DataAccessError ? error.message : "Error al cargar los datos."}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
            >
              Reintentar
            </button>
          )}
        </div>
      ) : vacio ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-8 text-sm text-muted-foreground">
          <Inbox size={22} />
          <p>Sin registros.</p>
        </div>
      ) : (
        children
      )}
    </section>
  );
}
