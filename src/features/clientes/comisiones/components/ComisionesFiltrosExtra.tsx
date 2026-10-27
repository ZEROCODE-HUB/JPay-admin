import type { Alcance, CargaComisionesState } from "../hooks/useCargaComisiones";

/** Filtros extra de la tabla: alcance (CVU / cuenta), legajo y CVU. */
export function ComisionesFiltrosExtra({ s }: { s: CargaComisionesState }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1 min-w-[170px]">
        <label className="text-xs font-medium text-muted-foreground">Alcance</label>
        <select
          value={s.alcance}
          onChange={(e) => {
            s.setAlcance(e.target.value as Alcance);
            s.setPage(0);
          }}
          className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="">Todos</option>
          <option value="cvu">Por CVU</option>
          <option value="cuenta">Toda la cuenta (respaldo)</option>
        </select>
      </div>
      <div className="space-y-1 min-w-[170px]">
        <label className="text-xs font-medium text-muted-foreground">Legajo</label>
        <input
          value={s.legajoFiltro}
          onChange={(e) => {
            s.setLegajoFiltro(e.target.value);
            s.setPage(0);
          }}
          placeholder="LPJ-30..."
          className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm font-mono"
        />
      </div>
      <div className="space-y-1 min-w-[220px]">
        <label className="text-xs font-medium text-muted-foreground">CVU</label>
        <input
          value={s.cvuFiltro}
          onChange={(e) => {
            s.setCvuFiltro(e.target.value);
            s.setPage(0);
          }}
          placeholder="0000003100..."
          className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm font-mono"
        />
      </div>
    </div>
  );
}
