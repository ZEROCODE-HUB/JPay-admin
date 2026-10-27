import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { EnlacesPage } from "@/features/link-pago/enlaces/components/EnlacesPage";

export const Route = createFileRoute("/admin/comercios/link-pago/")({
  component: EnlacesPage,
  head: () => ({
    meta: [
      { title: pageTitle("Enlaces de pago — Admin") },
      { name: "description", content: "Enlaces de pago creados desde Enterprise." },
    ],
  }),
});
