import { createFileRoute, redirect } from "@tanstack/react-router";

/** URL vieja: la carga de comisiones vive en Finanzas JPay → Comisiones. */
export const Route = createFileRoute("/admin/general/usuarios/comisiones")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/finanzas/comisiones/carga", replace: true });
  },
});
