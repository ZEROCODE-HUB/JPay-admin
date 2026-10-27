import type { Dispatch, ReactNode, SetStateAction } from "react";
import { contarPaginas } from "../utils";
import type { ErrorListado } from "../types";
import { MensajeEstado } from "./MensajeEstado";

const BTN_PAGINA =
  "inline-flex h-9 items-center rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed";

/**
 * Cargando / error / vacío / tabla + paginación "Anterior · Siguiente", igual en
 * las tres pantallas de impuestos.
 */
export function ListadoPaginado({
  isLoading,
  isError,
  isEmpty,
  isFetching,
  error,
  onRetry,
  page,
  setPage,
  total,
  pageSize,
  textos,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  isFetching: boolean;
  error: ErrorListado;
  onRetry: () => void;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  total: number;
  pageSize: number;
  textos: { cargando: string; errorTitulo: string; vacio: string; contador: string };
  children: ReactNode;
}) {
  const totalPaginas = contarPaginas(total, pageSize);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
        <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
        {textos.cargando}
      </div>
    );
  }
  if (isError) {
    return (
      <MensajeEstado
        tipo={error?.permission ? "permiso" : "error"}
        mensaje={error?.message ?? "Error desconocido"}
        errorTitulo={textos.errorTitulo}
        vacioTexto={textos.vacio}
        onRetry={onRetry}
      />
    );
  }
  if (isEmpty) {
    return (
      <MensajeEstado
        tipo="vacio"
        mensaje=""
        errorTitulo={textos.errorTitulo}
        vacioTexto={textos.vacio}
      />
    );
  }
  return (
    <>
      {children}
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span>
          {total} {textos.contador} · página {page + 1} de {totalPaginas}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page === 0 || isFetching}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className={BTN_PAGINA}
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={page + 1 >= totalPaginas || isFetching}
            onClick={() => setPage((p) => p + 1)}
            className={BTN_PAGINA}
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
}
