import { Search } from "lucide-react";
import { Card, Input, Label } from "@/components/portal-shell";
import type { Comercio, EstadoLote } from "@/lib/api/types";
import { BANDERAS_FALLBACK, ESTADOS_FILTRO } from "../estados";
import type { LotesFiltrosState } from "../hooks/useLotesFiltros";

const SELECT_CLASS = "w-full h-8 px-2 rounded-md border bg-background text-xs";

/** Barra de filtros de la grilla de lotes. */
export function LotesFiltros({
  f,
  opcionesBandera,
  comercios,
}: {
  f: LotesFiltrosState;
  opcionesBandera: string[];
  comercios: Comercio[];
}) {
  // Fallback por si el catálogo no responde.
  const banderas = opcionesBandera.length > 0 ? opcionesBandera : BANDERAS_FALLBACK;
  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <Label>Buscar</Label>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              value={f.search}
              onChange={(e) => f.setSearch(e.target.value)}
              placeholder="Código, comercio, legajo o CUIT…"
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>
        <div>
          <Label>Estado</Label>
          <select
            value={f.estado}
            onChange={(e) => f.setEstado(e.target.value as EstadoLote | "")}
            className={`${SELECT_CLASS} sm:min-w-[130px]`}
          >
            <option value="">Todos</option>
            {ESTADOS_FILTRO.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Bandera</Label>
          <select
            value={f.bandera}
            onChange={(e) => f.setBandera(e.target.value)}
            className={`${SELECT_CLASS} sm:min-w-[130px]`}
          >
            <option value="">Todas</option>
            {banderas.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Comercio</Label>
          <select
            value={f.comercioId}
            onChange={(e) => f.setComercioId(e.target.value)}
            className={`${SELECT_CLASS} sm:min-w-[180px]`}
          >
            <option value="">Todos</option>
            {comercios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombreComercio ?? c.usuario} · {c.legajo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Desde</Label>
          <Input
            type="date"
            value={f.fechaDesde}
            onChange={(e) => f.setFechaDesde(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div>
          <Label>Hasta</Label>
          <Input
            type="date"
            value={f.fechaHasta}
            onChange={(e) => f.setFechaHasta(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>
    </Card>
  );
}
