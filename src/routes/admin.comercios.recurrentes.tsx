import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, Label } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { pageTitle } from "@/brand/brand";
import { listComerciosConEcartPay } from "@/lib/api/comercios-ecartpay";
import { usePaisConModulos } from "@/shared/modulos-pais";
import { DomiciliacionesPanel } from "@/shared/ui/domiciliaciones-panel";
import { SuscripcionesPanel } from "@/shared/ui/suscripciones-panel";

export const Route = createFileRoute("/admin/comercios/recurrentes")({
  head: () => ({ meta: [{ title: pageTitle("Suscripciones y domiciliación — Admin") }] }),
  component: Page,
});

/** Suscripciones y domiciliaciones de cada comercio (con su cuenta de Ecart Pay). */
function Page() {
  const pais = usePaisConModulos();
  const comercios = useQuery({
    queryKey: ["comercios", "con-ecartpay"],
    queryFn: listComerciosConEcartPay,
  });
  const [elegido, setElegido] = useState("");
  const [vista, setVista] = useState<"suscripciones" | "domiciliacion">(
    pais.modulos.suscripciones ? "suscripciones" : "domiciliacion",
  );
  const lista = comercios.data ?? [];
  const comercioId = elegido || lista[0]?.id || "";
  const actual = lista.find((c) => c.id === comercioId);
  const vistas = [
    { key: "suscripciones" as const, label: "Suscripciones", visible: pais.modulos.suscripciones },
    { key: "domiciliacion" as const, label: "Domiciliación", visible: pais.modulos.domiciliacion },
  ].filter((v) => v.visible);

  return (
    <PermissionGuard recurso="comercios">
      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="rec-comercio">Comercio</Label>
              {comercios.isLoading ? (
                <p className="mt-2 text-sm text-muted-foreground">Cargando…</p>
              ) : comercios.isError ? (
                <p className="mt-2 text-sm text-danger-600">{(comercios.error as Error).message}</p>
              ) : lista.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Ningún comercio tiene Ecart Pay conectado.
                </p>
              ) : (
                <select
                  id="rec-comercio"
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
            </div>
            <div className="flex gap-1 border-b border-border">
              {vistas.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setVista(v.key)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                    vista === v.key
                      ? "border-primary text-primary-ink"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {actual && vista === "suscripciones" && (
          <SuscripcionesPanel
            key={`s-${actual.id}`}
            comercioId={actual.id}
            titulo={`Suscripciones de ${actual.nombre}`}
            descripcion="Cobros recurrentes con tarjeta en la cuenta de Ecart Pay del comercio."
          />
        )}
        {actual && vista === "domiciliacion" && (
          <DomiciliacionesPanel
            key={`d-${actual.id}`}
            comercioId={actual.id}
            titulo={`Domiciliación de ${actual.nombre}`}
            descripcion="Cargos a la CLABE de los clientes del comercio, con su aceptación."
          />
        )}
      </div>
    </PermissionGuard>
  );
}
