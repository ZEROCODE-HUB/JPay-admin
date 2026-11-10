import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Enlace de la reorganización del menú, ya deshecha: los depósitos sin asignar están en
 * Integraciones → País y proveedores (tarjeta Cobre).
 */
export const Route = createFileRoute("/admin/cobros/sin-asignar")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/configuracion/paises", replace: true });
  },
});
