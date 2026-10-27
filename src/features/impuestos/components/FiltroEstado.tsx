import { Label } from "@/components/portal-shell";
import type { EstadoFiltro } from "../types";

/** Select "Estado: Todos / Activo / Inactivo" de los listados de impuestos. */
export function FiltroEstado({
  value,
  onChange,
}: {
  value: EstadoFiltro;
  onChange: (v: EstadoFiltro) => void;
}) {
  return (
    <div>
      <Label htmlFor="f-estado">Estado</Label>
      <select
        id="f-estado"
        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        value={value}
        onChange={(e) => onChange(e.target.value as EstadoFiltro)}
      >
        <option value="">Todos</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
      </select>
    </div>
  );
}
