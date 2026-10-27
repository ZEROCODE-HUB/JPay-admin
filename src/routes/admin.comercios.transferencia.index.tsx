import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { QrPosPage } from "@/features/transferencia/qr-pos/components/QrPosPage";

export const Route = createFileRoute("/admin/comercios/transferencia/")({
  component: QrPosPage,
  head: () => ({
    meta: [
      { title: pageTitle("Pagos con QR — Admin") },
      { name: "description", content: "QRs/POS creados por comercios desde Enterprise." },
    ],
  }),
});
