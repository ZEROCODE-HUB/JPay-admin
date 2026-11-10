import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Enlace de la reorganización del menú, ya deshecha: las comisiones de JPay están en Comercios →
 * Comisiones de JPay.
 */
export const Route = createFileRoute("/admin/finanzas/comisiones/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/comercios/comisiones-jpay", replace: true });
  },
});
