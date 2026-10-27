import { formatDateTime, formatMoney } from "@/shared/format";
import { Badge } from "@/components/portal-shell";
import type { Movimiento } from "@/lib/api/types";
import { AccionesMenu } from "./AccionesMenu";

export function TablaMovimientos({
  rows,
  onVerDetalles,
  onCambiarEstado,
}: {
  rows: Movimiento[];
  onVerDetalles?: (m: Movimiento) => void;
  onCambiarEstado?: (m: Movimiento) => void;
}) {
  const conAcciones = Boolean(onVerDetalles || onCambiarEstado);
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">TX</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium text-right">Monto operación</th>
            <th className="px-4 py-3 font-medium text-right">Comisión</th>
            <th className="px-4 py-3 font-medium text-right">Impuesto</th>
            <th className="px-4 py-3 font-medium text-right">Cobrado</th>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            {conAcciones && <th className="px-4 py-3 font-medium text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3 font-mono text-xs">{m.idTxn}</td>
              <td className="px-4 py-3">{m.tipo}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatMoney(m.montoOperacion)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatMoney(m.comision)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatMoney(m.impuesto)}</td>
              <td className="px-4 py-3 text-right tabular-nums font-medium">
                {formatMoney(m.montoCobrado)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(m.fecha)}</td>
              <td className="px-4 py-3">
                <Badge tone={m.esFinal ? "success" : "warn"}>
                  {m.estadoNombre ?? m.estadoCodigo ?? "—"}
                </Badge>
              </td>
              {conAcciones && (
                <td className="px-4 py-3 text-right">
                  <AccionesMenu
                    items={[
                      ...(onVerDetalles
                        ? [{ label: "Ver detalles", onClick: () => onVerDetalles(m) }]
                        : []),
                      ...(onCambiarEstado
                        ? [{ label: "Cambiar estado", onClick: () => onCambiarEstado(m) }]
                        : []),
                    ]}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
