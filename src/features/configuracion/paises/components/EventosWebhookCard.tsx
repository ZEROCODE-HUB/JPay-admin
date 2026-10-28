import { toast } from "sonner";
import { Badge, Card } from "@/components/portal-shell";
import { useEventosWebhook, usePaisesMutaciones } from "@/hooks/usePaises";
import type { EventoWebhook } from "@/lib/api/paises";
import { formatDateTime } from "@/shared/format";
import { avisarError } from "../utils";

function Firma({ e }: { e: EventoWebhook }) {
  if (e.firmaValida === true) return <Badge tone="success">Firmado</Badge>;
  if (e.firmaValida === false) return <Badge tone="danger">Firma inválida</Badge>;
  return <Badge tone="neutral">Sin firma</Badge>;
}

const tonoResultado = (r: string | null): "neutral" | "success" | "warn" | "danger" =>
  !r
    ? "warn"
    : r === "error" || r === "rechazado"
      ? "danger"
      : r.includes("pagado")
        ? "success"
        : "neutral";

/**
 * Avisos de Ecart Pay (webhooks firmados y notify_url de cada orden). Ningún aviso cambia un
 * estado por su contenido: se consulta la orden. "Reprocesar" repite esa consulta.
 */
export function EventosWebhookCard() {
  const { eventos, tarea } = useEventosWebhook();
  const { reprocesarEvento } = usePaisesMutaciones();
  const data = eventos.data ?? [];
  const t = tarea.data;

  const reprocesar = (id: string) =>
    reprocesarEvento.mutate(id, {
      onSuccess: () => toast.success("Aviso reprocesado"),
      onError: avisarError,
    });

  return (
    <Card>
      <h3 className="font-semibold">Avisos de Ecart Pay</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Cada aviso dispara una consulta de la orden a Ecart Pay; su contenido no cambia estados.
        {t?.ultimaCorridaAt &&
          ` Revisión de pagos pendientes: ${formatDateTime(t.ultimaCorridaAt)}${
            typeof t.resultado.revisados === "number" ? ` (${t.resultado.revisados} revisados)` : ""
          }.`}
      </p>
      {eventos.isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
      ) : eventos.error ? (
        <p className="mt-4 text-sm text-danger-600">No se pudieron cargar los avisos.</p>
      ) : data.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Todavía no llegó ningún aviso.</p>
      ) : (
        <div className="mt-4 overflow-x-auto max-h-[28rem]">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground text-left sticky top-0 bg-card">
              <tr>
                <th className="py-2 pr-4">Recibido</th>
                <th className="py-2 pr-4">Evento</th>
                <th className="py-2 pr-4">Orden</th>
                <th className="py-2 pr-4">Firma</th>
                <th className="py-2 pr-4">Resultado</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {data.map((e) => (
                <tr key={e.id} className="border-t border-border align-top">
                  <td className="py-2 pr-4 text-xs whitespace-nowrap">
                    {formatDateTime(e.recibidoAt)}
                  </td>
                  <td className="py-2 pr-4">
                    {e.evento ?? (e.origen === "notify_url" ? "notify_url" : "—")}
                    {e.estadoExterno && (
                      <span className="block text-xs text-muted-foreground">
                        dice: {e.estadoExterno}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs break-all">{e.idExterno ?? "—"}</td>
                  <td className="py-2 pr-4">
                    <Firma e={e} />
                  </td>
                  <td className="py-2 pr-4">
                    <Badge tone={tonoResultado(e.resultado)}>{e.resultado ?? "sin procesar"}</Badge>
                    {e.error && (
                      <span className="block mt-1 text-xs text-danger-600 max-w-xs">{e.error}</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {e.firmaValida !== false && e.idExterno && (
                      <button
                        type="button"
                        className="text-xs font-medium text-secondary hover:underline disabled:opacity-50"
                        disabled={reprocesarEvento.isPending}
                        onClick={() => reprocesar(e.id)}
                      >
                        Reprocesar
                      </button>
                    )}
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
