import { CalendarDays, FileSpreadsheet, FileText, Loader2, X } from "lucide-react";
import type { CalendarioAcreditacion } from "@/lib/api/calendario-acreditaciones";
import { formatMoney } from "@/shared/format";
import { useDiaDetalle } from "../hooks/useDiaDetalle";
import { totalesDia } from "../utils";
import { LoteDiaCard } from "./LoteDiaCard";

function BotonExport({
  formato,
  exporting,
  onExport,
}: {
  formato: "xlsx" | "pdf";
  exporting: "xlsx" | "pdf" | null;
  onExport: (f: "xlsx" | "pdf") => void;
}) {
  const Icono = formato === "xlsx" ? FileSpreadsheet : FileText;
  return (
    <button
      onClick={() => onExport(formato)}
      disabled={exporting !== null}
      className="h-8 px-3 rounded-md border bg-card text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-muted disabled:opacity-50"
    >
      {exporting === formato ? <Loader2 size={12} className="animate-spin" /> : <Icono size={12} />}
      {formato === "xlsx" ? "Excel" : "PDF"}
    </button>
  );
}

/** Modal con el desglose de los lotes que se acreditan en un día. */
export function DiaDetalleModal({
  fecha,
  items,
  onClose,
  minMonto,
}: {
  fecha: string;
  items: CalendarioAcreditacion[];
  onClose: () => void;
  minMonto: number;
}) {
  const d = useDiaDetalle(fecha, items);
  const t = totalesDia(items);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b px-6 py-4 z-10">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <CalendarDays size={18} /> {d.fechaFormateada}
              </h3>
              <p className="text-sm text-muted-foreground">
                {items.length} lote{items.length !== 1 ? "s" : ""} · {t.operaciones} operaciones
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BotonExport formato="xlsx" exporting={d.exporting} onExport={d.onExport} />
              <BotonExport formato="pdf" exporting={d.exporting} onExport={d.onExport} />
              <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-md">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Resumen del día */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-md border bg-muted/30 px-3 py-2">
              <div className="text-muted-foreground">Total bruto</div>
              <div className="font-mono font-semibold text-base">{formatMoney(t.bruto)}</div>
            </div>
            <div className="rounded-md border bg-muted/30 px-3 py-2">
              <div className="text-muted-foreground">Total neto</div>
              <div className="font-mono font-semibold text-base text-emerald-700">
                {formatMoney(t.neto)}
              </div>
            </div>
            <div className="rounded-md border bg-amber-50 border-amber-200 px-3 py-2">
              <div className="text-amber-700">Adelantos reservados</div>
              <div className="font-mono font-semibold text-base text-amber-700">
                {formatMoney(t.adelantosReservados)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {items.map((it) => (
            <LoteDiaCard
              key={it.id}
              it={it}
              tieneAd={d.tieneAdelantoAprobado(it.comercioId)}
              adelantos={d.adelantosDe(it.comercioId)}
              minMonto={minMonto}
              onAdelantar={(adelantoId) => d.irAAdelantos(it.comercioId, adelantoId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
