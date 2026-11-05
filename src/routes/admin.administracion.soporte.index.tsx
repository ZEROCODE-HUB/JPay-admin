import { createFileRoute } from "@tanstack/react-router";
import { ConsultaSpeiMx } from "@/features/soporte/ConsultaSpeiMx";

export const Route = createFileRoute("/admin/administracion/soporte/")({
  head: () => ({ meta: [{ title: "Consultas frecuentes — Admin Panel" }] }),
  component: ConsultaSpeiMx,
});
