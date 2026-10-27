import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { ResolversPage } from "@/features/apis/resolvers/components/ResolversPage";

export const Route = createFileRoute("/admin/comercios/apis/resolvers")({
  component: ResolversPage,
  head: () => ({
    meta: [
      { title: pageTitle("Resolvers — APIs externas — Admin") },
      { name: "description", content: "Gestión de resolvers PCT (pagos con transferencia)." },
    ],
  }),
});
