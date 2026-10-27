import { Inbox } from "lucide-react";
import { formatMoney } from "@/shared/format";
import { Badge } from "@/components/portal-shell";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import type { ClienteDetalleData } from "../hooks/useClienteDetalle";
import type { ClienteDetalleUi } from "../hooks/useClienteDetalleUi";

/** Pop-ups de la pestaña Módulos: comercios PST y links de pago. */
export function ModulosModales({ data, ui }: { data: ClienteDetalleData; ui: ClienteDetalleUi }) {
  const { comerciosPstQuery, linksPagoQuery, comerciosPst, linksPago } = data;
  const { pstOpen, setPstOpen, linksOpen, setLinksOpen } = ui;

  return (
    <>
      <ModalDialog
        open={pstOpen}
        onClose={() => setPstOpen(false)}
        title="Comercios PST vinculados"
        description="Comercios vinculados al cliente vía PST."
      >
        {comerciosPstQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : comerciosPst.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-8 text-sm text-muted-foreground">
            <Inbox size={22} />
            <p>No se encontró comercio PST asociado por email o por legajo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Comercio</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Legajo</th>
                </tr>
              </thead>
              <tbody>
                {comerciosPst.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3">{c.nombre}</td>
                    <td className="px-4 py-3">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{c.legajo_comercio ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ModalDialog>

      <ModalDialog
        open={linksOpen}
        onClose={() => setLinksOpen(false)}
        title="Links de pago"
        description="Comercios vinculados y sus links de pago."
      >
        {linksPagoQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : linksPago.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-8 text-sm text-muted-foreground">
            <Inbox size={22} />
            <p>Sin links de pago vinculados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {linksPago.map((l) => (
              <div key={l.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{l.comercio_nombre}</span>
                  {l.estado && (
                    <Badge tone={l.estado === "Activo" ? "success" : "neutral"}>{l.estado}</Badge>
                  )}
                </div>
                {l.url && (
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-xs font-medium text-primary-ink break-all"
                  >
                    {l.url}
                  </a>
                )}
                {l.monto != null && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Monto: {formatMoney(l.monto)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </ModalDialog>
    </>
  );
}
