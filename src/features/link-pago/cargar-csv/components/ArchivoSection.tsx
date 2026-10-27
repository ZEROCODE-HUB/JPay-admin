import { AlertTriangle, ChevronDown, ChevronRight, Download } from "lucide-react";
import { FileDropzone } from "@/components/file-dropzone";
import { Label } from "@/components/portal-shell";
import { EJEMPLO_ARCHIVO } from "@/lib/liquidaciones/parse";
import type { CargarCsvState } from "../hooks/useCargarCsv";

/** Paso 1: elegir el archivo, ver el formato y el resumen de lectura (mapeo de columnas). */
export function ArchivoSection({ s }: { s: CargarCsvState }) {
  const { parseado } = s;
  return (
    <>
      <div>
        <Label>Archivo de liquidación de Payway</Label>
        <div className="mt-1.5">
          <FileDropzone onFile={s.setFile} accept=".csv,.txt,text/csv,text/plain" />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <details className="flex-1">
            <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground">
              Ver formato esperado
            </summary>
            <pre className="mt-1.5 p-2.5 rounded-md bg-muted/50 text-[10px] leading-relaxed overflow-x-auto whitespace-pre">
              {EJEMPLO_ARCHIVO}
            </pre>
            <p className="text-[11px] text-muted-foreground mt-1">
              Delimitador punto y coma. Las columnas se buscan por nombre, así que el orden no
              importa. La base del cálculo es <span className="font-mono">TOTAL_NETO</span>. Las
              líneas antes del encabezado se ignoran, así que el título del periodo no molesta.
            </p>
          </details>
          <button
            type="button"
            onClick={s.descargarCsvContracargoDemo}
            className="h-8 px-3 rounded-md border bg-card text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-muted shrink-0"
            title="Descarga un CSV con 5 contracargos simulados para probar el importador"
          >
            <Download size={12} /> CSV de prueba (contracargos)
          </button>
        </div>
      </div>

      {s.parseError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-sm text-danger-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{s.parseError}</span>
        </div>
      )}

      {s.parsing && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          Leyendo archivo...
        </p>
      )}

      {parseado && (
        <div className="rounded-lg border p-3 space-y-2">
          <button
            type="button"
            onClick={() => s.setVerColumnas((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            {s.verColumnas ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Lectura del archivo
          </button>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span>
              Encabezado en la línea{" "}
              <span className="font-mono text-foreground">{parseado.lineaEncabezado}</span>
            </span>
            <span>
              <span className="font-mono text-foreground">{parseado.renglones.length}</span>{" "}
              renglones
            </span>
            {parseado.sinMovimiento > 0 && (
              <span>
                <span className="font-mono text-foreground">{parseado.sinMovimiento}</span> sin
                movimiento (importes en 0)
              </span>
            )}
            {parseado.descartados.length > 0 && (
              <span className="text-danger-600">
                <span className="font-mono">{parseado.descartados.length}</span> descartados
              </span>
            )}
          </div>

          {parseado.encabezadoLineas.map((l, i) => (
            <p key={i} className="text-[11px] text-muted-foreground">
              <span className="font-mono text-foreground">Línea {i + 1} (ignorada):</span> {l}
            </p>
          ))}

          {s.verColumnas && (
            <div className="pt-1">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-1 font-medium">Se usa como</th>
                    <th className="py-1 font-medium text-right">Posición</th>
                  </tr>
                </thead>
                <tbody>
                  {parseado.mapeo.map((c) => (
                    <tr key={c.archivo} className="border-t">
                      <td className="py-1 font-mono">{c.archivo}</td>
                      <td className="py-1 text-right font-mono tabular-nums text-muted-foreground">
                        {c.indice === null ? "-" : c.indice + 1}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
