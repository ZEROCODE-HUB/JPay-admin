import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, FileUp, Receipt, Store } from "lucide-react";
import { Badge, Card } from "@/components/portal-shell";
import { listLoteMovimientos } from "@/lib/api/lotes";
import type { LoteAcreditacion } from "@/lib/api/types";
import { formatDate } from "@/shared/format";
import { toneLote } from "../estados";
import { descargarCsvPrueba, exportarLoteXlsx } from "../descargas";
import { legajoComercio, nombreComercio } from "../utils";
import { LoteDesglose } from "./LoteDesglose";
import { LoteMovimientosTabla } from "./LoteMovimientosTabla";

/** Modal de detalle de un lote: datos, desglose financiero, movimientos y acciones. */
export function LoteDetalleModal({
  lote,
  onClose,
  onSubirCsv,
}: {
  lote: LoteAcreditacion;
  onClose: () => void;
  onSubirCsv: (l: LoteAcreditacion) => void;
}) {
  const { data: movimientos } = useQuery({
    queryKey: ["lote-movimientos", lote.id],
    queryFn: () => listLoteMovimientos(lote.id),
  });
  const esCuotas = (lote.cuotas ?? 1) > 1;
  const movs = movimientos ?? [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex justify-between items-start">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Receipt size={18} /> Detalle del lote
            </h3>
            <p className="text-sm font-mono text-muted-foreground">
              {lote.codigo} · {formatDate(lote.fecha)} · {nombreComercio(lote, lote.comercioId)} ·{" "}
              {lote.bandera} {esCuotas ? `· ${lote.cuotas} cuotas` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportarLoteXlsx(lote)}
              className="p-1.5 hover:bg-muted rounded-md"
              title="Exportar a Excel"
            >
              <Download size={18} />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-md">
              ✕
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar size={12} /> Fecha estimada
              </div>
              <div className="font-mono font-semibold mt-1">{formatDate(lote.fecha)}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                Cobro real:{" "}
                {lote.fechaCobroReal ? (
                  <>
                    <span className="font-mono">{formatDate(lote.fechaCobroReal)}</span>
                    <Badge tone="success">real</Badge>
                  </>
                ) : (
                  <Badge tone="neutral">est.</Badge>
                )}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Store size={12} /> Comercio
              </div>
              <div className="font-semibold mt-1 truncate">{nombreComercio(lote)}</div>
              <div className="font-mono text-xs text-muted-foreground">{legajoComercio(lote)}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Bandera</div>
              <div className="font-semibold mt-1">{lote.bandera}</div>
              <div className="text-xs text-muted-foreground">
                {esCuotas ? `${lote.cuotas} cuotas` : "Pago único"}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Estado</div>
              <div className="mt-1">
                <Badge tone={toneLote(lote.estado)}>{lote.estado}</Badge>
              </div>
              <div className="font-mono text-xs mt-1">{lote.cantidadOperaciones} ops</div>
            </Card>
          </div>

          <LoteDesglose lote={lote} />
          <LoteMovimientosTabla movs={movs} />

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            {lote.estado === "Programado" && (
              <>
                <button
                  onClick={() => descargarCsvPrueba(lote, movs)}
                  className="h-9 px-4 rounded-md text-sm font-semibold bg-card border text-foreground hover:bg-muted"
                  title="Genera un archivo de Payway coherente con este lote, para probar el flujo Programado → Pendiente sin esperar al archivo real"
                >
                  <FileUp size={14} className="inline mr-1.5" /> Descargar CSV de prueba
                </button>
                <button
                  onClick={() => onSubirCsv(lote)}
                  className="h-9 px-4 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90"
                >
                  <FileUp size={14} className="inline mr-1.5" /> Subir CSV
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
