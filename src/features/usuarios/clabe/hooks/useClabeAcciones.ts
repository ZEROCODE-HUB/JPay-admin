import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, Landmark, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { ActionItem } from "@/components/actions-dropdown";
import { updateSubcuenta, type SubcuentaConCliente } from "@/lib/api/subcuentas";
import { useCan } from "@/lib/permissions";

/** Menú de acciones por fila + estado del modal de detalle. */
export function useClabeAcciones() {
  const queryClient = useQueryClient();
  const [viewing, setViewing] = useState<SubcuentaConCliente | null>(null);

  const { can } = useCan();
  const puedeModificar = can("modificar", "usuarios");
  const navigate = useNavigate();

  const invalidar = (legajo: string) => {
    queryClient.invalidateQueries({ queryKey: ["subcuentas-clabe"] });
    queryClient.invalidateQueries({ queryKey: ["subcuentas", legajo] });
  };

  const getActions = (row: SubcuentaConCliente): ActionItem[] => {
    const items: ActionItem[] = [
      { label: "Ver detalles", icon: Eye, onClick: () => setViewing(row) },
    ];

    // Sin CLABE todavía: Cobre la asigna al aprobar el alta del cliente (pestaña Cobre).
    if (!row.cbu) {
      items.push({
        label: "Dar de alta en Cobre",
        icon: Landmark,
        onClick: () =>
          navigate({
            to: "/admin/general/usuarios/$legajo",
            params: { legajo: row.legajo },
          }),
      });
    }

    items.push({
      label: row.estado === "Activa" ? "Deshabilitar" : "Habilitar",
      icon: XCircle,
      variant: row.estado === "Activa" ? ("danger" as const) : undefined,
      disabled: !puedeModificar,
      onClick: async () => {
        try {
          await updateSubcuenta(row.legajo, row.id, {
            estado: row.estado === "Activa" ? "Pausada" : "Activa",
          });
          invalidar(row.legajo);
        } catch (e) {
          toast.error((e as Error).message);
        }
      },
    });

    return items;
  };

  return { getActions, viewing, setViewing };
}
