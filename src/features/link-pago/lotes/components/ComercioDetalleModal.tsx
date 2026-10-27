import { useQuery } from "@tanstack/react-query";
import { Store, Wallet } from "lucide-react";
import { brand } from "@/brand/brand";
import { Badge, Card } from "@/components/portal-shell";
import { listAdelantosByComercio } from "@/lib/api/adelantos";
import type { LoteAcreditacion } from "@/lib/api/types";
import { formatDate, formatMoney } from "@/shared/format";
import { toneAdelanto, toneLote } from "../estados";
import type { ResumenComercio } from "../utils";

function LotesDelComercio({ lotes }: { lotes: LoteAcreditacion[] }) {
  const conContracargo = lotes.some((l) => (l.contracargoMonto ?? 0) > 0);
  return (
    <Card className="p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        Lotes por bandera de este comercio ({lotes.length})
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-2 py-1.5">Lote</th>
              <th className="px-2 py-1.5">Bandera</th>
              <th className="px-2 py-1.5">Fecha</th>
              <th className="px-2 py-1.5 text-right">Importe a acreditar</th>
              <th className="px-2 py-1.5">Estado</th>
              {conContracargo && <th className="px-2 py-1.5 text-right">Contracargo</th>}
            </tr>
          </thead>
          <tbody>
            {lotes.map((l) => {
              const contra = l.contracargoMonto ?? 0;
              return (
                <tr key={l.id} className="border-b last:border-0">
                  <td className="px-2 py-1.5 font-mono">{l.codigo}</td>
                  <td className="px-2 py-1.5">
                    <span className="inline-flex rounded-full border px-2 py-0.5 text-[11px] bg-muted/50">
                      {l.bandera}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 font-mono">{formatDate(l.fecha)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{formatMoney(l.importeNeto)}</td>
                  <td className="px-2 py-1.5">
                    <Badge tone={toneLote(l.estado)}>{l.estado}</Badge>
                  </td>
                  {conContracargo && (
                    <td className="px-2 py-1.5 text-right font-mono text-danger-600">
                      {contra ? `- ${formatMoney(contra)}` : "—"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AdelantosComercio({ comercioId }: { comercioId: string }) {
  const { data: adelantos, isLoading } = useQuery({
    queryKey: ["adelantos", comercioId],
    queryFn: () => listAdelantosByComercio(comercioId),
  });
  return (
    <Card className="p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
        <Wallet size={12} /> Adelantos
      </h4>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando adelantos…</p>
      ) : !adelantos || adelantos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sin solicitudes de adelanto para este comercio.
        </p>
      ) : (
        <div className="space-y-3">
          {adelantos.map((a) => (
            <div key={a.id} className="rounded-lg border px-3 py-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estado</span>
                <Badge tone={toneAdelanto(a.estado)}>{a.estado}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto solicitado</span>
                <span className="font-mono font-semibold">{formatMoney(a.montoSolicitado)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Plazo</span>
                <span className="font-mono">
                  {a.plazoAdelantadoDias}d / {a.plazoOriginalDias}d ·{" "}
                  {a.tasaInteresPct != null ? `${a.tasaInteresPct}%` : "tasa pendiente"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Solicitado {formatDate(a.fechaSolicitud)}
                {a.fechaResolucion ? ` · Resuelto ${formatDate(a.fechaResolucion)}` : ""}
              </div>
              {a.montoPorAcreditar != null && a.montoPorAcreditar > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Monto por acreditar</span>
                  <span className="font-mono font-semibold text-amber-700">
                    {formatMoney(a.montoPorAcreditar)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/** Modal del resumen de un comercio: totales, sus lotes por bandera y sus adelantos. */
export function ComercioDetalleModal({
  data,
  lotes,
  onClose,
}: {
  data: ResumenComercio;
  lotes: LoteAcreditacion[];
  onClose: () => void;
}) {
  const lotesDelComercio = lotes.filter((l) => l.comercioId === data.comercioId);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex justify-between items-start">
          <div>
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Store size={18} /> {data.comercio}
            </h3>
            <p className="text-sm font-mono text-muted-foreground">
              {data.legajo} · {data.cantidadLotes} lotes · {data.cantidadOps} ops
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-md">
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Total pendiente de acreditar</div>
              <div className="font-mono font-semibold mt-1">
                {formatMoney(data.pendienteAcreditar)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Máximo adelantable{" "}
                {data.totalContracargo
                  ? `— contracargo ${formatMoney(data.totalContracargo)} descontado`
                  : ""}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Pendiente de impuestos</div>
              <div className="font-mono font-semibold mt-1">
                {formatMoney(data.pendienteImpuestos)}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Comisión total PayWay</div>
              <div className="font-mono font-semibold mt-1">{formatMoney(data.totalPayWay)}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Neto {brand.name}</div>
              <div className="font-mono font-semibold mt-1 text-emerald-700">
                {formatMoney(data.totalPropio)}
              </div>
            </Card>
            {data.totalContracargo > 0 && (
              <Card className="p-3 border-danger-200 bg-danger-50">
                <div className="text-xs text-danger-700">Contracargo retenido</div>
                <div className="font-mono font-semibold mt-1 text-danger-600">
                  - {formatMoney(data.totalContracargo)}
                </div>
                <div className="text-[11px] text-danger-600">Restado del total a acreditar</div>
              </Card>
            )}
            <Card className={`p-3 ${data.totalContracargo > 0 ? "" : "col-span-2"}`}>
              <div className="text-xs text-muted-foreground">Total a pagar al comercio</div>
              <div className="font-mono font-semibold mt-1 text-emerald-700">
                {formatMoney(data.totalFinal)}
              </div>
            </Card>
          </div>
          <LotesDelComercio lotes={lotesDelComercio} />
          <AdelantosComercio comercioId={data.comercioId} />
        </div>
      </div>
    </div>
  );
}
