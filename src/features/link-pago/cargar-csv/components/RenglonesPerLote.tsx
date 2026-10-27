import { AlertTriangle } from "lucide-react";
import { Badge, Label } from "@/components/portal-shell";
import type { LoteAcreditacion } from "@/lib/api/types";
import {
  marcaCoincide,
  type OverrideRenglon,
  type PreviewAcreditacion,
} from "@/lib/liquidaciones/acreditacion";
import { formatDate, formatMoney } from "@/shared/format";
import type { CargarCsvState } from "../hooks/useCargarCsv";
import { ETIQUETA_ESTADO } from "../utils";

const TH = "px-2.5 py-2 font-medium";
const TD = "px-2.5 py-1.5";

/** Modo per-lote: renglones del archivo con su estado y el override manual (Auto/Aplicar/Excluir). */
export function RenglonesPerLote({
  s,
  lote,
  preview,
}: {
  s: CargarCsvState;
  lote: LoteAcreditacion;
  preview: PreviewAcreditacion;
}) {
  const cantOverrides = Object.keys(s.overrides).length;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label>Renglones del archivo</Label>
        <span className="text-[11px] text-muted-foreground">
          {preview.aplicables.length} de {preview.renglones.length} aplican a este lote
        </span>
      </div>
      <div className="rounded-lg border overflow-hidden">
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 sticky top-0">
              <tr className="text-left">
                <th className={TH}>Fecha</th>
                <th className={TH}>Marca</th>
                <th className={TH}>Estab.</th>
                <th className={TH}>Comercio</th>
                <th className={`${TH} text-right`}>Bruto CSV</th>
                <th className={`${TH} text-right`}>Neto CSV</th>
                <th className={`${TH} text-right`}>Dif.</th>
                <th className={TH}>Estado</th>
                <th className={TH}>Match</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {preview.renglones.map((m) => {
                const et = ETIQUETA_ESTADO[m.estado];
                const ov = s.overrides[m.renglon.nro] ?? "";
                const forcible = !m.renglon.error;
                return (
                  <tr key={m.renglon.nro} className={m.acreditable ? "" : "text-muted-foreground"}>
                    <td className={`${TD} font-mono tabular-nums`}>
                      {formatDate(m.renglon.fecha)}
                    </td>
                    <td className={TD}>{m.renglon.marca || "-"}</td>
                    <td className={`${TD} font-mono`}>{m.renglon.establecimiento || "-"}</td>
                    <td className={`${TD} truncate max-w-[140px]`}>{m.comercioNombre ?? "-"}</td>
                    <td className={`${TD} text-right font-mono tabular-nums`}>
                      {formatMoney(m.renglon.totalBruto)}
                    </td>
                    <td className={`${TD} text-right font-mono tabular-nums`}>
                      {formatMoney(m.renglon.totalNeto)}
                    </td>
                    <td
                      className={`${TD} text-right font-mono tabular-nums ${
                        m.acreditable && m.diferencia > 0 ? "text-amber-600" : ""
                      }`}
                    >
                      {m.acreditable ? formatMoney(m.diferencia) : "-"}
                    </td>
                    <td className={TD}>
                      <Badge tone={et.tone}>{et.texto}</Badge>
                      {m.renglon.error && (
                        <span className="block text-[10px] text-danger-600 mt-0.5">
                          {m.renglon.error}
                        </span>
                      )}
                      {m.estado === "sin_establecimiento" &&
                        marcaCoincide(m.renglon.marca, lote.bandera) && (
                          <span className="block text-[10px] mt-0.5">puede ser de este lote</span>
                        )}
                    </td>
                    <td className={TD}>
                      <select
                        value={ov}
                        disabled={!forcible}
                        onChange={(e) => {
                          const v = e.target.value;
                          s.setOverride(
                            m.renglon.nro,
                            v === "aplicar" || v === "excluir" ? (v as OverrideRenglon) : null,
                          );
                        }}
                        className="h-7 rounded border border-input bg-background px-1.5 text-[11px] outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
                      >
                        <option value="">Auto</option>
                        <option value="aplicar">Aplicar</option>
                        <option value="excluir">Excluir</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {cantOverrides > 0 && (
        <p className="mt-2 text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded px-3 py-2">
          {cantOverrides} renglón(es) corregido(s) a mano. El cálculo de arriba ya los tiene en
          cuenta.
        </p>
      )}

      {preview.excedeTolerancia && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            El bruto del CSV difiere del lote en {formatMoney(preview.diferenciaBruto)} (
            {preview.diferenciaBrutoPct}%), más allá de la tolerancia de{" "}
            {s.parametros.toleranciaBrutoPct}%. Se aplica igual.
          </span>
        </div>
      )}
    </div>
  );
}
