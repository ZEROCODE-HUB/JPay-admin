import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Enlace de la reorganización del menú, ya deshecha: las aprobaciones de Cobre están en
 * Integraciones → País y proveedores (tarjeta Cobre).
 */
export const Route = createFileRoute("/admin/envios/aprobaciones")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/configuracion/paises", replace: true });
  },
});
