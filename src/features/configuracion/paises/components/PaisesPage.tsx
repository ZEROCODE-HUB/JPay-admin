import { usePaisesConfig } from "@/hooks/usePaises";
import { ConexionEcartPayCard } from "./ConexionEcartPayCard";
import { ConexionesComerciosCard } from "./ConexionesComerciosCard";
import { ConfiguracionPagosCard } from "./ConfiguracionPagosCard";
import { EventosWebhookCard } from "./EventosWebhookCard";
import { FeriadosCard } from "./FeriadosCard";
import { PaisesCard } from "./PaisesCard";
import { ProveedoresCard } from "./ProveedoresCard";

/** Configuración > País y proveedores. */
export function PaisesPage() {
  const { paises, proveedores, configuracion, isLoading, error } = usePaisesConfig();
  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando configuración…</p>;
  if (error) {
    return (
      <p className="text-sm text-danger-600">
        No se pudo cargar la configuración de países: {error.message}
      </p>
    );
  }
  const instalacion = paises.find((p) => p.predeterminado);
  const ecartpay = proveedores.find((p) => p.codigo === "ecartpay");
  return (
    <div className="space-y-4">
      {ecartpay && <ConexionEcartPayCard proveedor={ecartpay} />}
      {ecartpay && <ConexionesComerciosCard />}
      {ecartpay && <EventosWebhookCard />}
      {configuracion.map((c) => (
        <ConfiguracionPagosCard key={`${c.pais}-${c.proveedor}`} config={c} />
      ))}
      <ProveedoresCard proveedores={proveedores} />
      <PaisesCard paises={paises} />
      {instalacion && <FeriadosCard pais={instalacion} />}
    </div>
  );
}
