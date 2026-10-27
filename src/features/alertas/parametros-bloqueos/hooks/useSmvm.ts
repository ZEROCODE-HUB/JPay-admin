import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { readSmvm, saveSmvm } from "@/lib/api/compliance";

/** Valor del SMVM: lectura, edición y guardado. */
export function useSmvm() {
  const queryClient = useQueryClient();
  const q = useQuery({ queryKey: ["smvm"], queryFn: readSmvm });
  const [valor, setValor] = useState("");
  const [guardando, setGuardando] = useState(false);
  useEffect(() => {
    if (q.data !== undefined) setValor(q.data > 0 ? String(q.data) : "");
  }, [q.data]);

  const guardar = async () => {
    const n = Number(valor);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Ingresá el valor vigente del SMVM (mayor a 0)");
      return;
    }
    setGuardando(true);
    try {
      await saveSmvm(Math.round(n * 100) / 100);
      await queryClient.invalidateQueries({ queryKey: ["smvm"] });
      toast.success("Valor del SMVM guardado");
    } catch (e) {
      toast.error(`No se pudo guardar: ${(e as Error).message}`);
    } finally {
      setGuardando(false);
    }
  };

  return { q, valor, setValor, guardando, guardar };
}
