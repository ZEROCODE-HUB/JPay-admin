import { Badge, Card } from "@/components/portal-shell";
import { Toggle } from "@/features/alertas/parametros-alertas/components/Toggle";
import { usePaisesMutaciones } from "@/hooks/usePaises";
import type { ProveedorPago } from "@/lib/api/paises";
import { avisarError } from "../utils";

/** Proveedores de pago: activación y entorno (pruebas o producción). */
export function ProveedoresCard({ proveedores }: { proveedores: ProveedorPago[] }) {
  const { actualizarProveedor } = usePaisesMutaciones();
  const cambiar = (codigo: string, cambios: Partial<Pick<ProveedorPago, "activo" | "sandbox">>) =>
    actualizarProveedor.mutate({ codigo, cambios }, { onError: avisarError });

  return (
    <Card>
      <h3 className="font-semibold">Proveedores de pago</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Las credenciales de cada proveedor viven en los secretos del servidor, nunca acá.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground text-left">
            <tr>
              <th className="py-2 pr-4">Proveedor</th>
              <th className="py-2 pr-4">País</th>
              <th className="py-2 pr-4">Medios</th>
              <th className="py-2 pr-4">Entorno</th>
              <th className="py-2 pr-4">Pruebas</th>
              <th className="py-2">Activo</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((p) => (
              <tr key={p.codigo} className="border-t border-border">
                <td className="py-2.5 pr-4">
                  <span className="font-medium">{p.nombre}</span>{" "}
                  <span className="font-mono text-xs text-muted-foreground">{p.codigo}</span>
                </td>
                <td className="py-2.5 pr-4">{p.pais}</td>
                <td className="py-2.5 pr-4 text-xs">{p.tipos.join(", ")}</td>
                <td className="py-2.5 pr-4">
                  <Badge tone={p.sandbox ? "warn" : "success"}>
                    {p.sandbox ? "Sandbox" : "Producción"}
                  </Badge>
                </td>
                <td className="py-2.5 pr-4">
                  {p.codigo === "cobre" ? (
                    // El modo de Cobre lo fija el secreto COBRE_MODO; la prueba de conexión lo
                    // refleja acá (un interruptor no tendría efecto).
                    <span className="text-xs text-muted-foreground">Por COBRE_MODO</span>
                  ) : (
                    <Toggle
                      label={`Entorno de pruebas de ${p.nombre}`}
                      enabled={p.sandbox}
                      onClick={() => cambiar(p.codigo, { sandbox: !p.sandbox })}
                    />
                  )}
                </td>
                <td className="py-2.5">
                  <Toggle
                    label={`Activar ${p.nombre}`}
                    enabled={p.activo}
                    onClick={() => cambiar(p.codigo, { activo: !p.activo })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
