import { usePaisesConfig } from "@/hooks/usePaises";
import { AlertasProveedorCard } from "./AlertasProveedorCard";
import { CobreCard } from "./CobreCard";
import { ConciliacionCard } from "./ConciliacionCard";
import { ConexionProveedorCard } from "./ConexionProveedorCard";
import { ContracargosCard } from "./ContracargosCard";
import { ConexionesComerciosCard } from "./ConexionesComerciosCard";
import { ConfiguracionPagosCard } from "./ConfiguracionPagosCard";
import { EventosWebhookCard } from "./EventosWebhookCard";
import { MsiCard } from "./MsiCard";
import { PuntosFisicosCard } from "./PuntosFisicosCard";
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
  const cobre = proveedores.find((p) => p.codigo === "cobre");
  return (
    <div className="space-y-4">
      {ecartpay && <AlertasProveedorCard proveedor="ecartpay" nombre="Ecart Pay" />}
      {ecartpay && <ConexionProveedorCard proveedor={ecartpay} />}
      {ecartpay && <ConexionesComerciosCard />}
      {ecartpay && (
        <ConciliacionCard
          proveedor="ecartpay"
          nombre="Ecart Pay"
          descripcion="Todos los días se comparan los pagos de JPay con las transacciones de cada comercio (últimos 3 días). También guarda la comisión y el neto de Ecart Pay en cada pago."
        />
      )}
      {ecartpay && <ContracargosCard />}
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
      {cobre && <CobreCard simulado={cobre.conexion.modo === "simulado"} />}
      {cobre && (
        <ConciliacionCard
          proveedor="cobre"
          nombre="Cobre"
          descripcion="Todos los días se cruzan las transacciones de las cuentas en Cobre (últimos 3 días) con los depósitos y transferencias de JPay, y el saldo en Cobre con el del ledger. Los depósitos que no llegaron por aviso se acreditan en ese momento."
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
