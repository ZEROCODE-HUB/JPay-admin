import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { EndpointsPage } from "@/features/apis/endpoints/components/EndpointsPage";

export const Route = createFileRoute("/admin/comercios/apis/endpoints")({
  component: EndpointsPage,
  head: () => ({
    meta: [{ title: pageTitle("APIs externas — Endpoints — Admin") }],
  }),
});
