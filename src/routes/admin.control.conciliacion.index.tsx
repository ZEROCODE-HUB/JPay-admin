import { createFileRoute, Navigate } from "@tanstack/react-router";
import { usePaisConModulos } from "@/shared/modulos-pais";

export const Route = createFileRoute("/admin/control/conciliacion/")({
  component: ConciliacionIndex,
});

/** Abre la pestaña del primer proveedor que tenga el país. */
function ConciliacionIndex() {
  const pais = usePaisConModulos();
  const to =
    !pais.modulos.pagos_proveedor && pais.modulos.transferencias_cobre
      ? "/admin/control/conciliacion/cobre"
      : "/admin/control/conciliacion/ecartpay";
  return <Navigate to={to} replace />;
}
