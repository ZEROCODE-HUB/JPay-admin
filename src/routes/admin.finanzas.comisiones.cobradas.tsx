import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Enlace de la reorganización del menú, ya deshecha: las comisiones cobradas están en General →
 * Movimientos → Comisiones.
 */
export const Route = createFileRoute("/admin/finanzas/comisiones/cobradas")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/general/movimientos/comisiones", replace: true });
  },
});
