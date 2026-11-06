import { Badge, Card } from "@/components/portal-shell";
import { useContracargosProveedor } from "@/hooks/usePaises";
import { formatDateTime, formatMoney } from "@/shared/format";

const ESTADO: Record<string, { label: string; tone: "success" | "warn" | "danger" | "neutral" }> = {
  created: { label: "Abierto", tone: "danger" },
  pending: { label: "Pendiente", tone: "danger" },
  in_review: { label: "En revisión", tone: "warn" },
  won: { label: "Ganado", tone: "success" },
  lost: { label: "Perdido", tone: "neutral" },
};

const MOTIVO: Record<string, string> = {
  fraudulent: "Fraude",
  duplicate: "Duplicado",
  product_not_received: "Producto no recibido",
};

/** Contracargos de Ecart Pay (llegan por webhook firmado). Las pruebas se suben en Ecart Pay. */
export function ContracargosCard() {
  const { data = [], isLoading, error } = useContracargosProveedor();
  return (
    <Card>
      <h3 className="font-semibold">Contracargos de Ecart Pay</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Llegan por aviso firmado. El comercio presenta las pruebas en su panel de Ecart Pay antes
        del vencimiento.
      </p>
      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-danger-600">No se pudieron cargar los contracargos.</p>
      ) : data.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No hay contracargos.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground text-left">
              <tr>
                <th className="py-2 pr-4">Comercio</th>
                <th className="py-2 pr-4">Orden</th>
                <th className="py-2 pr-4 text-right">Monto</th>
                <th className="py-2 pr-4">Motivo</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2">Vence</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => {
                const e = ESTADO[c.estado] ?? { label: c.estado, tone: "neutral" as const };
                return (
                  <tr key={c.id} className="border-t border-border">
                    <td className="py-2 pr-4 font-mono text-xs">{c.legajo ?? "—"}</td>
                    <td className="py-2 pr-4 font-mono text-xs break-all">{c.ordenId ?? "—"}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {c.monto != null ? formatMoney(c.monto) : "—"}
                    </td>
                    <td className="py-2 pr-4">{MOTIVO[c.motivo ?? ""] ?? c.motivo ?? "—"}</td>
                    <td className="py-2 pr-4">
                      <Badge tone={e.tone}>{e.label}</Badge>
                    </td>
                    <td className="py-2 text-xs whitespace-nowrap">
                      {c.venceAt ? formatDateTime(c.venceAt) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
