import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, Label } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { pageTitle } from "@/brand/brand";
import { PuntosFisicosCard } from "@/features/configuracion/paises/components/PuntosFisicosCard";
import { listComerciosConEcartPay } from "@/lib/api/comercios-ecartpay";
import { PuntosFisicosPanel } from "@/shared/ui/puntos-fisicos-panel";

export const Route = createFileRoute("/admin/comercios/pos")({
  head: () => ({ meta: [{ title: pageTitle("POS físico — Admin") }] }),
  component: Page,
});

/**
 * POS físico: resumen de las sucursales y cajas de todos los comercios, y alta / edición de los
 * puntos de venta del comercio elegido (se crean también en su cuenta de Ecart Pay).
 */
function Page() {
  const comercios = useQuery({
    queryKey: ["comercios", "con-ecartpay"],
    queryFn: listComerciosConEcartPay,
  });
  const [elegido, setElegido] = useState<string>("");
  const lista = comercios.data ?? [];
  const comercioId = elegido || lista[0]?.id || "";
  const actual = lista.find((c) => c.id === comercioId);

  return (
    <PermissionGuard recurso="comercios">
      <div className="space-y-6">
        <PuntosFisicosCard />

        <Card>
          <Label htmlFor="pos-comercio">Comercio</Label>
          {comercios.isLoading ? (
            <p className="mt-2 text-sm text-muted-foreground">Cargando…</p>
          ) : comercios.isError ? (
            <p className="mt-2 text-sm text-danger-600">{(comercios.error as Error).message}</p>
          ) : lista.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Ningún comercio tiene Ecart Pay conectado. El comercio lo conecta desde su portal
              (Integraciones).
            </p>
          ) : (
            <select
              id="pos-comercio"
              className="mt-1 w-full md:w-96 h-10 px-3 rounded-md border border-input bg-card text-sm"
              value={comercioId}
              onChange={(e) => setElegido(e.target.value)}
            >
              {lista.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} · {c.legajo}
                  {c.entorno === "sandbox" ? " (sandbox)" : ""}
                </option>
              ))}
            </select>
          )}
        </Card>

        {actual && (
          <PuntosFisicosPanel
            key={actual.id}
            comercioId={actual.id}
            titulo={`POS de ${actual.nombre}`}
            descripcion="Sucursales, cajas (puntos de venta) y terminales en la cuenta de Ecart Pay del comercio."
          />
        )}
      </div>
    </PermissionGuard>
  );
}
