import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/portal-shell";
import type { CalendarioAcreditacion, EstadoCalendario } from "@/lib/api/calendario-acreditaciones";
import { formatMoney } from "@/shared/format";
import { DIAS_SEMANA, ESTADO_COLORS, colorEstado } from "../estados";
import { claveFecha, fechaCorta, resumenCelda, type DiaCalendario } from "../utils";

function DiaCelda({
  dia,
  items,
  minMonto,
  onClick,
}: {
  dia: DiaCalendario;
  items: CalendarioAcreditacion[];
  minMonto: number;
  onClick: () => void;
}) {
  const tieneItems = items.length > 0;
  const r = resumenCelda(items, minMonto);

  return (
    <button
      type="button"
      onClick={() => tieneItems && onClick()}
      disabled={!tieneItems}
      className={`text-left min-h-[120px] border-b border-r p-2 transition-colors ${
        !dia.esOtroMes
          ? dia.esPasado
            ? "bg-green-50/30 hover:bg-green-50/50"
            : "hover:bg-muted/30"
          : "bg-muted/30 text-muted-foreground"
      } ${dia.esActual ? "ring-2 ring-primary/30 bg-primary/5" : ""} ${
        tieneItems ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`text-sm font-semibold ${dia.esActual ? "text-primary-ink" : ""}`}>
          {fechaCorta(dia.fecha)}
        </span>
        {tieneItems && (
          <span className="text-[10px] bg-primary/10 text-primary-ink px-1.5 py-0.5 rounded">
            {r.operaciones} ops
          </span>
        )}
      </div>

      {tieneItems && (
        <div className="space-y-1">
          <div className="font-mono text-sm font-semibold">{formatMoney(r.totalBruto)}</div>
          {items.slice(0, 2).map((it) => {
            const color = colorEstado(it.estadoCalculado);
            return (
              <div
                key={it.id}
                className={`text-[10px] p-1 rounded truncate ${color.bg} ${color.text}`}
                title={`${it.comercioNombre} · ${it.bandera} · ${formatMoney(it.importeBruto)}`}
              >
                {it.bandera} · {it.comercioLegajo}
              </div>
            );
          })}
          {items.length > 2 && (
            <div className="text-[10px] text-muted-foreground text-center">
              +{items.length - 2} más
            </div>
          )}

          {r.tieneAdelanto && (
            <div className="mt-1 rounded bg-amber-100 border border-amber-300 px-1.5 py-1 text-[10px] text-amber-800">
              <div className="font-semibold flex items-center gap-1">
                <AlertTriangle size={10} /> Adelanto
              </div>
              <div className="font-mono">-{formatMoney(r.totalAdelantos)}</div>
              <div className="font-mono">Libre: {formatMoney(r.netoDespuesAdelantos)}</div>
              {r.cupoAgotado && (
                <div className="text-danger-700 font-semibold mt-0.5">Cupo agotado</div>
              )}
            </div>
          )}
        </div>
      )}
    </button>
  );
}

/** Grilla mensual 7×N. */
export function CalendarioGrilla({
  dias,
  porFecha,
  estadoFilter,
  minMonto,
  onDiaClick,
}: {
  dias: DiaCalendario[];
  porFecha: Map<string, CalendarioAcreditacion[]>;
  estadoFilter: EstadoCalendario | "";
  minMonto: number;
  onDiaClick: (fechaKey: string) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="p-2 text-center text-xs font-semibold text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dias.map((dia, idx) => {
          const fechaKey = claveFecha(dia.fecha);
          const items = porFecha.get(fechaKey) ?? [];

          // Si hay filtro de estado, opacamos los días que no matchean
          if (estadoFilter && !items.some((i) => i.estadoCalculado === estadoFilter)) {
            return (
              <div key={idx} className="min-h-[120px] border-b border-r p-2 bg-muted/10 opacity-50">
                <div className="text-sm font-semibold text-muted-foreground">
                  {dia.fecha.getDate()}
                </div>
              </div>
            );
          }

          return (
            <DiaCelda
              key={idx}
              dia={dia}
              items={items}
              minMonto={minMonto}
              onClick={() => onDiaClick(fechaKey)}
            />
          );
        })}
      </div>
    </Card>
  );
}

export function CalendarioLeyenda() {
  return (
    <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
      {Object.entries(ESTADO_COLORS).map(([key, val]) => (
        <div key={key} className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${val.bg}`} />
          <span>{val.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
        <span>Adelanto reservado</span>
      </div>
    </div>
  );
}
