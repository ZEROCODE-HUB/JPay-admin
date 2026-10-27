import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useClientesForSelect } from "@/hooks/useComercios";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getClienteByCorreo } from "@/lib/api/clientes";
import { asignarCvuParaNuevo } from "@/lib/api/cvu";
import type { SubcuentaTipo } from "@/lib/api/subcuentas";

/** Estado y alta del modal "Nuevo CVU". */
export function useNuevoCvu() {
  const queryClient = useQueryClient();
  const [showNuevo, setShowNuevo] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formAlias, setFormAlias] = useState("");
  const [formTipo, setFormTipo] = useState<SubcuentaTipo>("Operativa");
  const [formSearch, setFormSearch] = useState("");
  const debouncedFormSearch = useDebouncedValue(formSearch, 350);
  const { data: clientesOpt } = useClientesForSelect(debouncedFormSearch || undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const crear = async () => {
    const email = formEmail.trim() || formSearch.trim();
    if (!email) {
      toast.error("Seleccioná un usuario por email");
      return;
    }
    setSaving(true);
    try {
      const cliente = await getClienteByCorreo(email.toLowerCase());
      if (!cliente) {
        toast.error("No existe un cliente con ese email");
        setSaving(false);
        return;
      }
      // Llamada centralizada: mismo flujo BDC + audit + fallback que el
      // boton "Generar CVU" del menu. Asi NO se inventan CVUs locales
      // para el CVU inicial del titular (que es el camino mas importante
      // regulatoriamente).
      const result = await asignarCvuParaNuevo({
        cliente: {
          id: cliente.id,
          legajo: cliente.legajo,
          correo: cliente.correo,
          cuit: cliente.cuit,
          nombre: cliente.nombre,
          tipoPersona: cliente.tipoPersona,
        },
        alias: formAlias.trim() || undefined,
        tipo: formTipo,
        origin: "admin",
      });

      // Si BDC rechazo explicitamente (alias_taken o cuit_invalid), el helper
      // ya mostro el toast y NO creo la subcuenta. Salimos sin cerrar el modal
      // para que el operador pueda corregir el alias.
      if (result.kind === "rechazado") {
        setSaving(false);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["cvus"] });
      queryClient.invalidateQueries({ queryKey: ["subcuentas", cliente.legajo] });
      setShowNuevo(false);
      setFormEmail("");
      setFormAlias("");
      setFormSearch("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return {
    showNuevo,
    setShowNuevo,
    setFormEmail,
    formAlias,
    setFormAlias,
    formTipo,
    setFormTipo,
    formSearch,
    setFormSearch,
    clientesOpt,
    formOpen,
    setFormOpen,
    saving,
    crear,
  };
}

export type NuevoCvu = ReturnType<typeof useNuevoCvu>;
