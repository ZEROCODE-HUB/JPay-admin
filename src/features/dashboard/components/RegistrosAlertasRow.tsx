import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2, Clock, ShieldAlert } from "lucide-react";
import { Card, Badge } from "@/components/portal-shell";

// Sin datos hasta conectar con la base: últimos registros y alertas recientes eran valores de
// ejemplo escritos a mano.

/** Últimos registros + alertas recientes. */
export function RegistrosAlertasRow() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Building2 size={16} className="text-secondary" /> Últimos registros
          </h3>
          <Link to="/admin/general/usuarios" className="text-xs text-primary-ink font-semibold">
            Ver todos ?
          </Link>
        </div>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground border-b">
                <th className="text-left font-display font-semibold py-2 px-5">Razon social</th>
                <th className="text-left font-display font-semibold py-2">CUIT</th>
                <th className="text-left font-display font-semibold py-2">Segmento</th>
                <th className="text-left font-display font-semibold py-2">Estado</th>
                <th className="text-right font-display font-semibold py-2 px-5">Volumen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td colSpan={5} className="py-6 px-5 text-center text-sm text-muted-foreground">
                  Sin registros.
                </td>
              </tr>
              {([] as string[][]).map(([n, c, seg, tone, e, v]) => (
                <tr key={n}>
                  <td className="py-2.5 px-5 font-semibold">{n}</td>
                  <td className="text-xs text-muted-foreground font-mono tabular-nums">{c}</td>
                  <td className="text-xs">{seg}</td>
                  <td>
                    <Badge tone={tone as "success" | "warn" | "danger"}>{e}</Badge>
                  </td>
                  <td className="text-right px-5 font-semibold font-mono tabular-nums">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <ShieldAlert size={16} className="text-primary-ink" /> Alertas recientes
          </h3>
          <Link
            to="/admin/general/alertas/bloqueos"
            className="text-xs text-primary-ink font-semibold"
          >
            Compliance ?
          </Link>
        </div>
        <p className="py-2.5 text-sm text-muted-foreground">Sin alertas.</p>
        <div className="divide-y">
          {([] as string[][]).map(([a, c, tone, t]) => (
            <div key={a} className="py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-semibold">{a}</div>
                <Badge tone={tone as "warn" | "danger"}>!</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{c}</div>
              <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1 mt-1">
                <Clock size={11} /> {t}
              </div>
            </div>
          ))}
        </div>
        <Link
          to="/admin/general/movimientos"
          className="mt-4 inline-flex items-center gap-1 text-xs text-primary-ink font-semibold"
        >
          Ver movimientos en tiempo real <ArrowUpRight size={12} />
        </Link>
      </Card>
    </div>
  );
}
