import { usePaisesConfig } from "@/hooks/usePaises";
import { AlertasProveedorCard } from "./AlertasProveedorCard";
import { CobreCard } from "./CobreCard";
import { ConexionProveedorCard } from "./ConexionProveedorCard";
import { ConexionesComerciosCard } from "./ConexionesComerciosCard";
import { ConfiguracionPagosCard } from "./ConfiguracionPagosCard";
import { EventosWebhookCard } from "./EventosWebhookCard";
import { MsiCard } from "./MsiCard";
import { PuntosFisicosCard } from "./PuntosFisicosCard";
import { FeriadosCard } from "./FeriadosCard";
import { PaisesCard } from "./PaisesCard";
import { ProveedoresCard } from "./ProveedoresCard";

/**
 * Configuración > País y proveedores: solo configuración (conexiones, webhooks, umbrales, MSI y
 * simuladores). La conciliación y las disputas están en Control.
 */
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
  const cobre = proveedores.find((p) => p.codigo === "cobre");
  return (
    <div className="space-y-4">
      {ecartpay && <AlertasProveedorCard proveedor="ecartpay" nombre="Ecart Pay" />}
      {ecartpay && <ConexionProveedorCard proveedor={ecartpay} />}
      {ecartpay && <ConexionesComerciosCard />}
      {ecartpay && <EventosWebhookCard />}
      {ecartpay && <MsiCard />}
      {ecartpay && <PuntosFisicosCard />}
      {cobre && (
        <ConexionProveedorCard
          proveedor={cobre}
          descripcion="Cuentas y transferencias SPEI. Mientras Cobre no entregue la instancia de prueba funciona con el simulador (COBRE_MODO)."
        />
      )}
      {cobre && <AlertasProveedorCard proveedor="cobre" nombre="Cobre" />}
      {/* Sin prueba de conexión todavía, el modo es el simulado (COBRE_MODO por defecto). */}
      {cobre && (
        <CobreCard
          simulado={cobre.conexion.modo !== "prueba" && cobre.conexion.modo !== "produccion"}
        />
      )}
      {configuracion.map((c) => (
        <ConfiguracionPagosCard key={`${c.pais}-${c.proveedor}`} config={c} />
      ))}
      <ProveedoresCard proveedores={proveedores} />
      <PaisesCard paises={paises} />
      {instalacion && <FeriadosCard pais={instalacion} />}
    </div>
  );
}
