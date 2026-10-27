import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Card, Label } from "@/components/portal-shell";
import type { EstadoCalendario } from "@/lib/api/calendario-acreditaciones";
import { ESTADOS_FILTRO } from "../estados";
import type { CalendarioState } from "../hooks/useCalendario";

/** Navegación de mes + filtros de comercio, bandera y estado. */
export function CalendarioToolbar({ s }: { s: CalendarioState }) {
  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={s.mesAnterior}
            className="h-8 w-8 rounded-md border bg-card hover:bg-muted flex items-center justify-center"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold min-w-[160px] text-center capitalize">{s.nombreMes}</span>
          <button
            onClick={s.mesSiguiente}
            className="h-8 w-8 rounded-md border bg-card hover:bg-muted flex items-center justify-center"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={s.irAHoy}
            className="h-8 px-3 rounded-md border bg-card hover:bg-muted text-xs font-medium"
          >
            Hoy
          </button>
        </div>
        <div>
          <Label>Comercio</Label>
          <select
            value={s.comercioFilter}
            onChange={(e) => s.setComercioFilter(e.target.value)}
            className="h-8 px-2 rounded-md border bg-background text-xs min-w-[180px]"
          >
            <option value="">Todos los comercios</option>
            {s.comerciosOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombreComercio ?? c.usuario} · {c.legajo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Bandera</Label>
          <select
            value={s.banderaFilter}
            onChange={(e) => s.setBanderaFilter(e.target.value)}
            className="h-8 px-2 rounded-md border bg-background text-xs"
          >
            <option value="">Todas</option>
            {s.banderasOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Estado</Label>
          <select
            value={s.estadoFilter}
            onChange={(e) => s.setEstadoFilter(e.target.value as EstadoCalendario | "")}
            className="h-8 px-2 rounded-md border bg-background text-xs"
          >
            <option value="">Todos</option>
            {ESTADOS_FILTRO.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {(s.comercioFilter || s.banderaFilter || s.estadoFilter) && (
          <button
            type="button"
            onClick={s.limpiarFiltros}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <X size={12} /> Limpiar filtros
          </button>
        )}
      </div>
    </Card>
  );
}
