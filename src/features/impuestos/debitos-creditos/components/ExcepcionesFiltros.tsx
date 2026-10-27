import { X } from "lucide-react";
import { Input, Label } from "@/components/portal-shell";
import { FiltroEstado } from "../../components/FiltroEstado";
import type { DebitosCreditosState } from "../hooks/useDebitosCreditos";

/** Banner de alta exitosa, aviso de presentación semanal y filtros. */
export function ExcepcionesFiltros({ s }: { s: DebitosCreditosState }) {
  return (
    <>
      {s.banner && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <span>{s.banner}</span>
          <button type="button" onClick={() => s.setBanner(null)} className="shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 mb-4">
        Este impuesto se presenta una vez por semana.
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="buscar">Buscar</Label>
          <Input
            id="buscar"
            value={s.searchInput}
            onChange={(e) => s.cambiarBusqueda(e.target.value)}
            placeholder="CUIT, email o motivo…"
          />
        </div>
        <FiltroEstado value={s.estadoFilter} onChange={s.cambiarEstado} />
      </div>
    </>
  );
}
