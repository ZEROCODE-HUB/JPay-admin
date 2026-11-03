import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/portal-shell";
import { getProductosCliente, type EstadoProducto } from "@/lib/api/productos-cliente";

const ESTADO: Record<EstadoProducto, { label: string; tone: "success" | "warn" | "neutral" }> = {
  activo: { label: "Activo", tone: "success" },
  pendiente: { label: "Pendiente", tone: "warn" },
  inactivo: { label: "Inactivo", tone: "neutral" },
  proximamente: { label: "Próximamente", tone: "neutral" },
};

/** Los 8 productos de México (4 de Cobre y 4 de Ecart Pay) con su estado para este cliente. */
export function ProductosMx({ legajo }: { legajo: string }) {
  const q = useQuery({
    queryKey: ["clientes", legajo, "productos-mx"],
    queryFn: () => getProductosCliente(legajo),
  });
  if (q.isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (q.isError) return <p className="text-sm text-danger-600">{(q.error as Error).message}</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(["Cobre", "Ecart Pay"] as const).map((proveedor) => (
        <div key={proveedor} className="rounded-lg border border-border">
          <p className="px-4 py-2.5 text-sm font-semibold border-b border-border">{proveedor}</p>
          <ul className="divide-y divide-border">
            {(q.data ?? [])
              .filter((p) => p.proveedor === proveedor)
              .map((p) => (
                <li key={p.nombre} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{p.nombre}</p>
                    <p className="text-xs text-muted-foreground">{p.descripcion}</p>
                    <p className="text-xs mt-1">{p.detalle}</p>
                  </div>
                  <Badge tone={ESTADO[p.estado].tone}>{ESTADO[p.estado].label}</Badge>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
