import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { SolicitudesPage } from "@/features/solicitudes/components/SolicitudesPage";

export const Route = createFileRoute("/admin/general/solicitudes")({
  head: () => ({
    meta: [
      { title: pageTitle("Solicitudes de contacto — Admin") },
      {
        name: "description",
        content: "Comercios que pidieron que un ejecutivo de JPay los contacte.",
      },
    ],
  }),
  component: SolicitudesPage,
});
