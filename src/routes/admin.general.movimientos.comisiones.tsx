import { createFileRoute, redirect } from "@tanstack/react-router";

/** URL vieja: las comisiones cobradas viven en Finanzas JPay → Comisiones. */
export const Route = createFileRoute("/admin/general/movimientos/comisiones")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/finanzas/comisiones/cobradas", replace: true });
  },
});
