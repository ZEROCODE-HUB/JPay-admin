import { AlertTriangle, Info } from "lucide-react";
import { Label } from "@/components/portal-shell";
import type { LoteAcreditacion } from "@/lib/api/types";
import { FormDialog } from "@/shared/ui/form-dialog";
import { formatMoney } from "@/shared/format";
import { useCargarCsv } from "../hooks/useCargarCsv";
import { submitLabelCarga, type ResultadoCargaCsv } from "../utils";
import { ArchivoSection } from "./ArchivoSection";
import { CalculoLote } from "./CalculoLote";
import { PreviewGeneralSection } from "./PreviewGeneralSection";
import { RenglonesPerLote } from "./RenglonesPerLote";

// Carga del archivo de liquidación de Payway para uno o varios lotes Programado.
// El modal separa dos modos:
//
//   1. Per-lote (lote prop): un único lote objetivo. Match con overrides, selector
//      manual de comercio cuando el mapa falla y parámetros editables; al confirmar
//      llama `aplicarLiquidacionLote` y deja el lote en Pendiente (no Acreditado).
//
//   2. General (sin lote prop): match contra TODOS los lotes Programado. Cada renglón
//      se asigna a un único lote (cercanía de fecha y diferencia de bruto). Confirmar
//      pasa cada lote que matcheó a Pendiente y deja el resto como estaba.

type Props = {
  open: boolean;
  /** Si viene, el modal trabaja en modo per-lote para este lote. */
  lote?: LoteAcreditacion | null;
  onClose: () => void;
  onCargado: (resultado: ResultadoCargaCsv) => void;
};

const AVISO_AMBAR =
  "flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800";

export function CargarCsvModal({ open, lote, onClose, onCargado }: Props) {
  const s = useCargarCsv({ open, lote, onClose, onCargado });
  const { modoPerLote, previewPerLote, previewGeneral, programados, sinCargaCsv } = s;

  const titulo =
    modoPerLote && lote ? `Cargar liquidación — ${lote.codigo}` : "Cargar liquidación de Payway";
  const descripcion = modoPerLote
    ? "Subí el archivo de liquidación para confirmar los importes. Quedará en Pendiente listo para acreditar."
    : "Subí el archivo de liquidación: los renglones que matcheen contra lotes Programado pasarán a Pendiente, el resto se queda donde está.";
  const hayPreviewPerLote = !!previewPerLote && previewPerLote.aplicables.length > 0;

  return (
    <FormDialog
      open={open}
      onClose={s.cerrar}
      title={titulo}
      description={descripcion}
      onSubmit={s.aplicar}
      submitLabel={submitLabelCarga(modoPerLote, previewPerLote, previewGeneral)}
      size="xl"
      isSubmitting={s.guardando}
      cancelLabel="Cancelar"
    >
      <div className="space-y-5">
        {/* Contexto: contra esto se compara el archivo (solo per-lote) */}
        {modoPerLote && lote && (
          <div className="rounded-lg border bg-muted/30 p-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="min-w-0">
                <div className="text-muted-foreground">Comercio</div>
                <div className="font-semibold truncate">
                  {lote.comercio?.nombreComercio ?? lote.comercio?.usuario ?? lote.comercioId}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Bandera</div>
                <div className="font-semibold">{lote.bandera}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Bruto estimado</div>
                <div className="font-mono font-semibold">{formatMoney(lote.importeBruto)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Neto estimado</div>
                <div className="font-mono font-semibold">{formatMoney(lote.importeNeto)}</div>
              </div>
            </div>
          </div>
        )}

        <ArchivoSection s={s} />

        {!s.tablaDisponible && !sinCargaCsv && (
          <div className={AVISO_AMBAR}>
            <Info size={15} className="mt-0.5 shrink-0" />
            <span>
              No se pudo leer el mapa de establecimientos de Payway. En modo por lote podés resolver
              el comercio abajo a mano.
            </span>
          </div>
        )}

        {modoPerLote && lote && previewPerLote && (
          <RenglonesPerLote s={s} lote={lote} preview={previewPerLote} />
        )}

        {/* Selector manual de comercio (solo per-lote) */}
        {modoPerLote && !sinCargaCsv && (
          <div className="rounded-lg border p-3 space-y-2">
            <Label htmlFor="cargarcsv-comercio">Comercio del archivo</Label>
            {s.comercios.isLoading ? (
              <p className="text-xs text-muted-foreground">Cargando comercios...</p>
            ) : (
              <select
                id="cargarcsv-comercio"
                value={s.comercioManual}
                onChange={(e) => s.setComercioManual(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="">Usar el mapa de establecimientos</option>
                {s.comercios.rows.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombreComercio ?? c.usuario} - {c.legajo}
                  </option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-muted-foreground">
              Solo aplica cuando el archivo trae un establecimiento que el mapa no conoce. Los
              renglones de ese establecimiento se cuentan para este lote.
            </p>
          </div>
        )}

        {!modoPerLote && previewGeneral && programados && programados.length > 0 && (
          <PreviewGeneralSection preview={previewGeneral} />
        )}

        {!modoPerLote &&
          s.parseado &&
          !s.cargandoProgramados &&
          programados &&
          programados.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
              <AlertTriangle size={14} className="inline mr-1.5 -mt-0.5" />
              No hay lotes en estado Programado en la base. Generá lotes desde el módulo de cobros
              antes de cargar liquidaciones.
            </div>
          )}

        {modoPerLote && lote && previewPerLote && (
          <CalculoLote s={s} lote={lote} preview={previewPerLote} />
        )}

        {!hayPreviewPerLote && modoPerLote && !sinCargaCsv && (
          <div className={AVISO_AMBAR}>
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>
              Ningún renglón del archivo corresponde a este lote. Revisá el archivo o resolvé el
              comercio arriba a mano.
            </span>
          </div>
        )}

        {s.errorGuardado && (
          <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-sm text-danger-700">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{s.errorGuardado}</span>
          </div>
        )}
      </div>
    </FormDialog>
  );
}
