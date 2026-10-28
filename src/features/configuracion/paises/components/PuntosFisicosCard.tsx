import { Badge, Card } from "@/components/portal-shell";
import { usePuntosFisicos } from "@/hooks/usePaises";

/** Sucursales de todos los comercios (Ecart Pay), con sus cajas y terminales vinculadas. */
export function PuntosFisicosCard() {
  const { data = [], isLoading, error } = usePuntosFisicos();
  return (
    <Card>
      <h3 className="font-semibold">Puntos físicos</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Sucursales y cajas que los comercios gestionan desde su portal (se crean también en Ecart
        Pay).
      </p>
      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-danger-600">No se pudieron cargar los puntos físicos.</p>
      ) : data.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Ningún comercio cargó sucursales.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground text-left">
              <tr>
                <th className="py-2 pr-4">Comercio</th>
                <th className="py-2 pr-4">Sucursal</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4">Cajas</th>
                <th className="py-2">Con terminal</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="py-2 pr-4">
                    {s.comercio}
                    <span className="block font-mono text-xs text-muted-foreground">
                      {s.legajo}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    {s.nombre}
                    {s.ciudad && (
                      <span className="block text-xs text-muted-foreground">{s.ciudad}</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <Badge tone={s.estado === "activa" ? "success" : "warn"}>{s.estado}</Badge>
                  </td>
                  <td className="py-2 pr-4 tabular-nums">{s.cajas}</td>
                  <td className="py-2 tabular-nums">{s.conTerminal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
