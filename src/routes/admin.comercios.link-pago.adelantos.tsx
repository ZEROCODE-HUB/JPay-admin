import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { pageTitle } from "@/brand/brand";
import { AdelantosPage } from "@/features/link-pago/adelantos/components/AdelantosPage";

/**
 * Deep link desde el calendario de acreditaciones:
 *   ?comercio=<uuid>  → filtra el listado al comercio (se mantiene hasta
 *                        que el operador lo limpie con "Limpiar")
 *   ?adelanto=<uuid>  → abre el modal del ticket apenas carga la fila
 */
const searchSchema = z.object({
  comercio: z.string().optional(),
  adelanto: z.string().optional(),
});

export const Route = createFileRoute("/admin/comercios/link-pago/adelantos")({
  validateSearch: searchSchema,
  component: AdelantosPage,
  head: () => ({
    meta: [
      { title: pageTitle("Adelantos de Dinero — Links de Pago — Admin") },
      { name: "description", content: "Solicitudes de adelanto de fondos de comercios." },
    ],
  }),
});
