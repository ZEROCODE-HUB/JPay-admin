import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";

/**
 * Mensaje de error / sin permiso / vacío del listado de clientes.
 * `agrupado` envuelve título y detalle en un `<div>` (layout de Personas físicas).
 */
export function EstadoMensaje({
  tipo,
  mensaje,
  onRetry,
  errorTitulo,
  vacioTexto,
  agrupado = false,
}: {
  tipo: "error" | "vacio" | "permiso";
  mensaje: string;
  onRetry?: () => void;
  errorTitulo: string;
  vacioTexto: string;
  agrupado?: boolean;
}) {
  const textos = (titulo: string): ReactNode => {
    const contenido = (
      <>
        <p className="font-semibold">{titulo}</p>
        <p className="mt-1">{mensaje}</p>
      </>
    );
    return agrupado ? <div>{contenido}</div> : contenido;
  };

  if (tipo === "permiso") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-6 py-12 text-center text-sm text-amber-800">
        <AlertTriangle size={28} />
        {textos("No tenés permiso para ver esto")}
      </div>
    );
  }
  if (tipo === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger-200 bg-danger-50 px-6 py-12 text-center text-sm text-danger-700">
        <AlertTriangle size={28} />
        {textos(errorTitulo)}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
      <Inbox size={28} />
      <p>{vacioTexto}</p>
    </div>
  );
}
