import { Link } from "@tanstack/react-router";
import { AlertTriangle, ChevronLeft, Inbox } from "lucide-react";
import { PageHeader } from "@/components/portal-shell";
import { DataAccessError } from "@/lib/api/errors";

export function ClienteCargando() {
  return (
    <>
      <PageHeader title="Ficha de cliente" />
      <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
        <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
        Cargando cliente…
      </div>
    </>
  );
}

export function ClienteError({ error, refetch }: { error: Error | null; refetch: () => void }) {
  const err = error instanceof DataAccessError ? error : null;
  return (
    <>
      <PageHeader
        title="Ficha de cliente"
        action={
          <Link
            to="/admin/general/usuarios"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-ink"
          >
            <ChevronLeft size={16} /> Volver a usuarios
          </Link>
        }
      />
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-xl px-6 py-12 text-center text-sm ${
          err?.permission
            ? "border border-amber-300 bg-amber-50 text-amber-800"
            : "border border-danger-200 bg-danger-50 text-danger-700"
        }`}
      >
        <AlertTriangle size={28} />
        <div>
          <p className="font-semibold">
            {err?.permission
              ? "No tenés permiso para ver esto"
              : "Ocurrió un error al cargar el cliente"}
          </p>
          <p className="mt-1">{error?.message ?? "Error desconocido"}</p>
        </div>
        {!err?.permission && (
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Reintentar
          </button>
        )}
      </div>
    </>
  );
}

export function ClienteNoEncontrado({ legajo }: { legajo: string }) {
  return (
    <>
      <PageHeader
        title="Cliente no encontrado"
        action={
          <Link
            to="/admin/general/usuarios"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-ink"
          >
            <ChevronLeft size={16} /> Volver a usuarios
          </Link>
        }
      />
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        <Inbox size={28} />
        <p>No se encontró ningún cliente con legajo “{legajo ?? ""}”.</p>
        <Link
          to="/admin/general/usuarios"
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
        >
          <ChevronLeft size={16} /> Volver a la lista de usuarios
        </Link>
      </div>
    </>
  );
}
