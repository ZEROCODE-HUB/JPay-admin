import { Calendar, Download, Search, Store } from "lucide-react";
import { BtnOutline, Card, Input, Label } from "@/components/portal-shell";
import type { LotesVentaState } from "../hooks/useLotesVenta";

const ICONO_CLS =
  "absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none";

export function LotesVentaFiltros({ s }: { s: LotesVentaState }) {
  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <Label>Buscar</Label>
          <div className="relative">
            <Search size={14} className={ICONO_CLS} />
            <Input
              value={s.search}
              onChange={(e) => s.setSearch(e.target.value)}
              placeholder="Comercio, legajo o bandera…"
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>
        <div>
          <Label>Bandera</Label>
          <div className="relative">
            <Store size={14} className={ICONO_CLS} />
            <select
              value={s.banderaFilter}
              onChange={(e) => s.setBanderaFilter(e.target.value)}
              className="w-full sm:min-w-[160px] h-8 pl-8 pr-2 rounded-md border bg-background text-xs"
            >
              <option value="">Todas</option>
              {s.banderas.map((b) => (
                <option key={b.id} value={b.nombre}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label>Comercio</Label>
          <select
            value={s.comercioFilter}
            onChange={(e) => s.setComercioFilter(e.target.value)}
            className="w-full sm:min-w-[180px] h-8 px-2 rounded-md border bg-background text-xs"
          >
            <option value="">Todos</option>
            {s.comerciosOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombreComercio ?? c.usuario} · {c.legajo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Desde</Label>
          <div className="relative">
            <Calendar size={14} className={ICONO_CLS} />
            <Input
              type="date"
              value={s.fechaDesde}
              onChange={(e) => s.setFechaDesde(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>
        <div>
          <Label>Hasta</Label>
          <div className="relative">
            <Calendar size={14} className={ICONO_CLS} />
            <Input
              type="date"
              value={s.fechaHasta}
              onChange={(e) => s.setFechaHasta(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>
        <BtnOutline onClick={s.exportar} disabled={s.exportando || s.isLoading}>
          <Download size={16} />
          {s.exportando ? "Exportando…" : "Descargar CSV"}
        </BtnOutline>
      </div>
    </Card>
  );
}
