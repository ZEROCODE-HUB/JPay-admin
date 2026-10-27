import { formatDate, formatMoney } from "@/shared/format";
import { Badge } from "@/components/portal-shell";
import type { ImpuestoAsignacion } from "@/lib/api/types";
import { AccionesMenu } from "./AccionesMenu";

export function TablaImpuestos({
  rows,
  onVerDetalles,
}: {
  rows: ImpuestoAsignacion[];
  onVerDetalles?: (a: ImpuestoAsignacion) => void;
}) {
  const conAcciones = Boolean(onVerDetalles);
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Impuesto</th>
            <th className="px-4 py-3 font-medium">Código</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium text-right">Monto / Tasa</th>
            <th className="px-4 py-3 font-medium">Fecha asignación</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            {conAcciones && <th className="px-4 py-3 font-medium text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3">{a.impuesto?.nombre ?? a.impuestoId}</td>
              <td className="px-4 py-3 font-mono text-xs">{a.impuesto?.codigo ?? "—"}</td>
              <td className="px-4 py-3">{a.impuesto?.tipo ?? a.tipo}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {(a.impuesto?.tipo ?? a.tipo) === "Porcentaje"
                  ? `${a.impuesto?.monto ?? a.monto ?? 0} %`
                  : formatMoney(a.impuesto?.monto ?? a.monto)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{formatDate(a.fechaAsignacion)}</td>
              <td className="px-4 py-3">
                <Badge tone={a.estado === "Activo" ? "success" : "neutral"}>{a.estado}</Badge>
              </td>
              {conAcciones && (
                <td className="px-4 py-3 text-right">
                  <AccionesMenu
                    items={
                      onVerDetalles
                        ? [{ label: "Ver detalles", onClick: () => onVerDetalles(a) }]
                        : []
                    }
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
