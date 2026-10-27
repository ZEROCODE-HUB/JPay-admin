import { Input, Label } from "@/components/portal-shell";
import { FiltroEstado } from "../../components/FiltroEstado";
import type { AsignacionesState } from "../hooks/useAsignacionesImpuestos";

/** Card de filtros: búsqueda, estado y rango de fechas. */
export function AsignacionesFiltros({ s }: { s: AsignacionesState }) {
  return (
    <div className="mb-4 bg-card border rounded-lg p-4 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="buscar">Buscar</Label>
        <Input
          id="buscar"
          value={s.searchInput}
          onChange={(e) => s.cambiarBusqueda(e.target.value)}
          placeholder="Código o nombre del impuesto…"
        />
      </div>
      <FiltroEstado value={s.estadoFilter} onChange={s.cambiarEstado} />
      <div>
        <Label htmlFor="f-desde">Fecha desde</Label>
        <Input
          id="f-desde"
          type="date"
          value={s.searchDesde}
          onChange={(e) => s.cambiarDesde(e.target.value)}
          className="h-9"
        />
      </div>
      <div>
        <Label htmlFor="f-hasta">Fecha hasta</Label>
        <Input
          id="f-hasta"
          type="date"
          value={s.searchHasta}
          onChange={(e) => s.cambiarHasta(e.target.value)}
          className="h-9"
        />
      </div>
    </div>
  );
}
