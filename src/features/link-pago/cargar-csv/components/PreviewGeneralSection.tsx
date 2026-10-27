import { FileUp } from "lucide-react";
import { formatDate, formatMoney } from "@/shared/format";
import type { PreviewGeneral } from "../utils";

/** Modo general: lotes Programado que matchearon y renglones que quedaron sin lote. */
export function PreviewGeneralSection({ preview }: { preview: PreviewGeneral }) {
  return (
    <>
      <div className="rounded-lg border p-3">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <FileUp size={14} /> Lotes que van a pasar a Pendiente ({preview.matches.length})
        </h4>
        {preview.matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ningún lote Programado matcheó con este archivo. Revisá que las fechas y comercios estén
            bien.
          </p>
        ) : (
          <div className="overflow-x-auto max-h-72 overflow-y-auto -mx-3">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 sticky top-0">
                <tr className="text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Lote</th>
                  <th className="px-3 py-2 font-medium">Comercio</th>
                  <th className="px-3 py-2 font-medium">Bandera</th>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium text-right">Bruto CSV</th>
                  <th className="px-3 py-2 font-medium text-right">Bruto est.</th>
                  <th className="px-3 py-2 font-medium text-right">Dif.</th>
                  <th className="px-3 py-2 font-medium text-right">Neto a acreditar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {preview.matches.map((m) => (
                  <tr key={m.lote.id}>
                    <td className="px-3 py-1.5 font-mono text-xs">{m.lote.codigo}</td>
                    <td className="px-3 py-1.5 truncate max-w-[160px]">
                      {m.lote.comercio?.nombreComercio ??
                        m.lote.comercio?.usuario ??
                        m.lote.comercioId}
                    </td>
                    <td className="px-3 py-1.5">{m.lote.bandera}</td>
                    <td className="px-3 py-1.5 font-mono tabular-nums">
                      {formatDate(m.lote.fecha)}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                      {formatMoney(m.preview.totales.brutoCsv)}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                      {formatMoney(m.lote.importeBruto)}
                    </td>
                    <td
                      className={`px-3 py-1.5 text-right font-mono tabular-nums ${
                        m.preview.diferenciaBruto > 0 ? "text-amber-600" : "text-muted-foreground"
                      }`}
                    >
                      {formatMoney(m.preview.diferenciaBruto)}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono font-semibold text-emerald-700">
                      {formatMoney(m.preview.totales.importeNeto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {preview.sinMatch.length > 0 && (
        <details className="rounded-lg border p-3 text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Renglones sin match ({preview.sinMatch.length}). El archivo los trae pero ningún lote
            Programado los recibió — siguen en Programado.
          </summary>
          <div className="overflow-x-auto max-h-48 overflow-y-auto mt-2">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 sticky top-0">
                <tr className="text-left text-muted-foreground">
                  <th className="px-2.5 py-1.5 font-medium">Fecha</th>
                  <th className="px-2.5 py-1.5 font-medium">Marca</th>
                  <th className="px-2.5 py-1.5 font-medium">Estab.</th>
                  <th className="px-2.5 py-1.5 font-medium text-right">Bruto</th>
                  <th className="px-2.5 py-1.5 font-medium text-right">Neto</th>
                  <th className="px-2.5 py-1.5 font-medium">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {preview.sinMatch.map((r) => (
                  <tr key={r.nro} className="text-muted-foreground">
                    <td className="px-2.5 py-1.5 font-mono tabular-nums">{formatDate(r.fecha)}</td>
                    <td className="px-2.5 py-1.5">{r.marca || "-"}</td>
                    <td className="px-2.5 py-1.5 font-mono">{r.establecimiento || "-"}</td>
                    <td className="px-2.5 py-1.5 text-right font-mono tabular-nums">
                      {formatMoney(r.totalBruto)}
                    </td>
                    <td className="px-2.5 py-1.5 text-right font-mono tabular-nums">
                      {formatMoney(r.totalNeto)}
                    </td>
                    <td className="px-2.5 py-1.5 text-amber-700">
                      {r.error ? r.error : "sin lote Programado"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </>
  );
}
