import { BtnOutline, Card, Input, Label } from "@/components/portal-shell";
import type { EstadoComercio, NivelComercio } from "@/lib/api/types";
import { ESTADOS_COMERCIO, NIVELES_COMERCIO } from "@/lib/api/types";
import type { ComerciosGestionState } from "../hooks/useComerciosGestion";

const SELECT =
  "w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

/** Barra de filtros del listado. Cualquier cambio vuelve a la primera página. */
export function ComerciosFiltros({ s }: { s: ComerciosGestionState }) {
  const cambiar =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      s.setPage(0);
    };

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="buscar">Buscar</Label>
          <Input
            id="buscar"
            value={s.searchInput}
            onChange={(e) => cambiar(s.setSearchInput)(e.target.value)}
            placeholder="Usuario (email) o legajo…"
          />
        </div>
        <div>
          <Label htmlFor="f-estado">Estado</Label>
          <select
            id="f-estado"
            className={SELECT}
            value={s.estadoFilter}
            onChange={(e) => cambiar(s.setEstadoFilter)(e.target.value as EstadoComercio | "")}
          >
            <option value="">Todos</option>
            {ESTADOS_COMERCIO.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="f-nivel">Nivel</Label>
          <select
            id="f-nivel"
            className={SELECT}
            value={s.nivelFilter}
            onChange={(e) => cambiar(s.setNivelFilter)(e.target.value as NivelComercio | "")}
          >
            <option value="">Todos</option>
            {NIVELES_COMERCIO.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="f-desde">Fecha desde</Label>
          <Input
            id="f-desde"
            type="date"
            value={s.fechaDesde}
            onChange={(e) => cambiar(s.setFechaDesde)(e.target.value)}
            className="h-10"
          />
        </div>
        <div>
          <Label htmlFor="f-hasta">Fecha hasta</Label>
          <Input
            id="f-hasta"
            type="date"
            value={s.fechaHasta}
            onChange={(e) => cambiar(s.setFechaHasta)(e.target.value)}
            className="h-10"
          />
        </div>
        {s.hayFiltros && (
          <BtnOutline type="button" onClick={s.limpiarFiltros}>
            Limpiar filtros
          </BtnOutline>
        )}
      </div>
    </Card>
  );
}
