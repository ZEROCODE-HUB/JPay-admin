import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createContracargo } from "@/lib/api/contracargos";
import { useComercios } from "@/hooks/useComercios";
import { parseImporte } from "../utils";

/** Formulario de "Simular contracargo". */
export function useCrearSimulacion(onClose: () => void) {
  const qc = useQueryClient();
  const [comercioId, setComercioId] = useState("");
  const [importe, setImporte] = useState("");
  const [ticket, setTicket] = useState("");
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);
  const comerciosQuery = useComercios({ page: 0, pageSize: 200 });
  const comerciosList = comerciosQuery.rows;

  const crear = async () => {
    if (!comercioId || !importe) {
      toast.error("Completá comercio e importe");
      return;
    }
    setSaving(true);
    try {
      await createContracargo({
        comercioId,
        importe: parseImporte(importe),
        ticketPayway: ticket || null,
        motivoPayway: motivo || null,
        estado: "Simulado",
        esSimulacion: true,
      });
      toast.success("Simulación de contracargo creada");
      qc.invalidateQueries({ queryKey: ["contracargos"] });
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return {
    comercioId,
    setComercioId,
    importe,
    setImporte,
    ticket,
    setTicket,
    motivo,
    setMotivo,
    saving,
    comerciosList,
    crear,
  };
}
