import { createFileRoute, redirect } from "@tanstack/react-router";

/** URL vieja: las comisiones de JPay viven en Finanzas JPay → Comisiones. */
export const Route = createFileRoute("/admin/comercios/comisiones-jpay")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/finanzas/comisiones", replace: true });
  },
});
