import { Badge, Card } from "@/components/portal-shell";
import type { Movimiento } from "@/lib/api/types";
import { formatDateShort, formatMoney, formatTime } from "@/shared/format";
import { toneMovimiento } from "../estados";

/** Card "Movimientos incluidos" del detalle del lote. */
export function LoteMovimientosTabla({ movs }: { movs: Movimiento[] }) {
  return (
    <Card className="p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        Movimientos incluidos ({movs.length})
      </h4>
      {movs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sin movimientos vinculados — el lote aún no tiene movimientos asignados o no se pudo
          cargar.
        </p>
      ) : (
        <div className="overflow-x-auto max-h-64 overflow-y-auto border rounded-lg">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/50 border-b">
              <tr className="text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">ID Txn</th>
                <th className="px-3 py-2 font-medium">Cliente</th>
                <th className="px-3 py-2 font-medium text-right">Importe</th>
                <th className="px-3 py-2 font-medium">Fecha</th>
                <th className="px-3 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movs.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{m.idTxn}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium truncate max-w-[140px]">
                      {m.cliente?.nombre ?? "—"}
                    </div>
                    <div className="text-muted-foreground text-[10px]">{m.cliente?.correo}</div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">
                    {formatMoney(m.montoOperacion)}
                  </td>
                  <td className="px-3 py-2 font-mono text-muted-foreground">
                    {formatDateShort(m.fecha)} {formatTime(m.fecha)}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={toneMovimiento(m.estadoCodigo)}>
                      {m.estadoNombre ?? m.estadoCodigo ?? "—"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
