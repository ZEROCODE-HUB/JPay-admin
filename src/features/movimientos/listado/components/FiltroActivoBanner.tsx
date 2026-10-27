import { Search } from "lucide-react";

/** Aviso de filtro activo por cliente (legajo de la URL) y/o TXID, con acción para limpiarlo. */
export function FiltroActivoBanner({
  legajo,
  txid,
  onLimpiar,
}: {
  legajo?: string;
  txid: string;
  onLimpiar: () => void;
}) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
      {legajo && (
        <span>
          Cliente <span className="font-mono font-semibold tabular-nums">{legajo}</span>
        </span>
      )}
      {txid && (
        <span className="inline-flex items-center gap-1">
          <Search size={13} /> TXID <span className="font-mono font-semibold">{txid}</span>
        </span>
      )}
      <button
        type="button"
        onClick={onLimpiar}
        className="ml-1 text-xs font-semibold text-primary-ink underline underline-offset-2"
      >
        Limpiar filtro
      </button>
    </div>
  );
}
