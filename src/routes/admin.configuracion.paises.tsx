import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { PaisesPage } from "@/features/configuracion/paises/components/PaisesPage";

export const Route = createFileRoute("/admin/configuracion/paises")({
  component: PaisesPage,
  head: () => ({
    meta: [
      { title: pageTitle("País y proveedores — Admin") },
      {
        name: "description",
        content: "Países, proveedores de pago y configuración de cobro de la plataforma.",
      },
    ],
  }),
});
