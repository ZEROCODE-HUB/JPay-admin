import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Enlaces de Control (conciliación y disputas) de la reorganización del menú, ya deshecha: están
 * en Integraciones → País y proveedores.
 */
export const Route = createFileRoute("/admin/control/$")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/configuracion/paises", replace: true });
  },
});
