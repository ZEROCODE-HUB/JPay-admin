import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Enlace de la reorganización del menú, ya deshecha: la carga de comisiones por cliente está en
 * General → Usuarios → Carga de comisiones.
 */
export const Route = createFileRoute("/admin/finanzas/comisiones/carga")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/general/usuarios/comisiones", replace: true });
  },
});
