import { Download } from "lucide-react";
import { BtnOutline, Card } from "@/components/portal-shell";
import { useAnalisisConciliacion } from "@/features/reportes/hooks/useAnalisisConciliacion";
import {
  buildCruceCsv,
  nombreCruceCsv,
  porcentajeExito,
  type Archivo,
} from "@/features/reportes/utils/conciliacion";
import { downloadFile } from "@/features/reportes/utils/download";
import {
  IdsResumidos,
  KpiConciliacion as Kpi,
  NoEncontradosTable,
} from "@/features/reportes/components/AnalisisConciliacionDetalle";

// Modal a mano (no ModalDialog): ancho max-w-3xl, header compacto y footer sticky propios.
export function AnalisisConciliacionModal({
  archivo,
  allArchivos,
  onClose,
}: {
  archivo: Archivo;
  allArchivos: Archivo[];
  onClose: () => void;
}) {
  const { resumen, loading, error, rangoLabel, movCount } = useAnalisisConciliacion(
    archivo,
    allArchivos,
  );

  const porcentaje = porcentajeExito(resumen);
  const fechaAnalisis = resumen?.fechaAnalisis ?? "";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-3xl max-h-[88vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b border-border px-5 py-3.5 flex justify-between items-start z-10">
          <div>
            <h3 className="font-display text-[15px] font-semibold leading-none">
              Análisis de conciliación
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {archivo.archivo} · {archivo.fecha} {rangoLabel ? `· ${rangoLabel}` : ""}
            </p>
            {rangoLabel && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Rango plataforma: {rangoLabel} — 1er reporte histórico, siguientes delta desde
                último.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-md leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          {loading && (
            <p className="text-sm text-muted-foreground">
              Analizando… cruzando ID_DEBIN ↔ id_txn y montos…
            </p>
          )}
          {error && <p className="text-sm text-danger-600">Error: {error}</p>}
          {resumen && !loading && !error && (
            <>
              {/* Resumen + éxito */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Resumen general
                  </h4>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {porcentaje}% éxito · {resumen.encontrados}/{resumen.total}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  <Kpi label="Total" value={resumen.total} />
                  <Kpi label="Encontrados" value={resumen.encontrados} accent />
                  <Kpi label="No encontrados" value={resumen.noEncontrados} />
                  <Kpi label="No completados" value={resumen.noCompletados} />
                  <Kpi label="Dif. monto" value={resumen.diferenciasMonto} />
                  <Kpi label="Éxito" value={`${porcentaje}%`} accent />
                </div>
                {resumen.soloPlataforma > 0 && (
                  <p className="text-[11px] text-amber-600 mt-2">
                    + {resumen.soloPlataforma} movimientos solo en plataforma (no están en banco)
                  </p>
                )}
              </Card>

              <Card className="p-4">
                <h4 className="font-display text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Distribución por tipo (TIPO_MOV_COELSA: CREDITO=Depósito / DEBITO=Retiro)
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <Kpi label="Depósitos · total" value={resumen.depositos.total} />
                  <Kpi label="Depósitos · encontrados" value={resumen.depositos.encontrados} />
                  <Kpi label="Retiros · total" value={resumen.retiros.total} />
                  <Kpi label="Retiros · encontrados" value={resumen.retiros.encontrados} />
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-display text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  No encontrados — detalle paginado (10 por página) · cruce ID_DEBIN → id_txn (+
                  fallback monto+fecha)
                </h4>
                <NoEncontradosTable items={resumen.items} />
                {resumen.idsDiferenciaMonto.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                      Diferencias de monto ({resumen.idsDiferenciaMonto.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {resumen.idsDiferenciaMonto.map((id) => (
                        <span
                          key={id}
                          className="inline-flex rounded-md border border-danger-200 bg-danger-50 px-1.5 py-0.5 font-mono text-[11px] text-danger-700"
                        >
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground mt-3">
                  Movimientos consultados en plataforma: {movCount} · Rango{" "}
                  {rangoLabel || archivo.fecha} · Si ves 0, la tabla <code>movimientos</code> no
                  tiene filas para ese rango o RLS lo bloquea; entonces 0 conciliados es esperado.
                </p>
              </Card>
              <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-4">
                <Card className="p-4">
                  <h4 className="font-display text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    IDs resumidos
                  </h4>
                  <IdsResumidos resumen={resumen} />
                </Card>

                <Card className="p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                      Análisis
                    </h4>
                    <p className="font-mono text-xs font-medium tabular-nums">{fechaAnalisis}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      {resumen.encontrados} de {resumen.total} conciliados — mapeo ID_DEBIN= id_txn,
                      |IMPORTE_COELSA|= monto_operacion
                    </p>
                  </div>
                  <BtnOutline
                    className="mt-3 h-7 text-xs px-2.5 w-full justify-center"
                    onClick={() =>
                      downloadFile(nombreCruceCsv(archivo.archivo), buildCruceCsv(resumen.items))
                    }
                  >
                    <Download size={14} /> Descargar cruce CSV
                  </BtnOutline>
                </Card>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-5 py-3 flex justify-end">
          <BtnOutline onClick={onClose} className="h-8 text-xs px-4">
            Cerrar
          </BtnOutline>
        </div>
      </div>
    </div>
  );
}
