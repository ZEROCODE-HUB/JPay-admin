import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Edit3, Eye, XCircle, Zap } from "lucide-react";
import { toast } from "sonner";
import type { ActionItem } from "@/components/actions-dropdown";
import { asignarCvuParaExistente } from "@/lib/api/cvu";
import { updateSubcuenta, type CvuRow } from "@/lib/api/subcuentas";
import { useCan } from "@/lib/permissions";

/** Menú de acciones por fila + estado de los modales de detalle y edición. */
export function useCvuAcciones() {
  const queryClient = useQueryClient();
  const [viewing, setViewing] = useState<CvuRow | null>(null);
  const [editTarget, setEditTarget] = useState<CvuRow | null>(null);
  const [editAlias, setEditAlias] = useState("");

  const { can } = useCan();
  const puedeCrear = can("crear", "usuarios");
  const puedeModificar = can("modificar", "usuarios");

  const invalidar = (legajo: string) => {
    queryClient.invalidateQueries({ queryKey: ["cvus"] });
    queryClient.invalidateQueries({ queryKey: ["subcuentas", legajo] });
  };

  const guardarEdicion = async () => {
    if (!editTarget) return;
    try {
      await updateSubcuenta(editTarget.clienteLegajo, editTarget.id, {
        cbu: editTarget.cbu ?? undefined,
      });
      // alias not stored in subcuenta, but we keep edit for demo (no column)
      toast.success("Actualizado");
      invalidar(editTarget.clienteLegajo);
      setEditTarget(null);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const getActions = (row: CvuRow): ActionItem[] => {
    const items: ActionItem[] = [
      { label: "Ver detalles", icon: Eye, onClick: () => setViewing(row) },
    ];

    // Acción contextual: si la subcuenta no tiene CVU todavia, el operador
    // puede pedir la asignacion contra BDC/COELSA. Toda la logica vive en
    // `asignarCvuParaExistente` (centralizada en `lib/api/cvu.ts`) para que
    // modal y menu compartan exactamente el mismo flow.
    if (!row.cbu) {
      items.push({
        label: "Generar CVU (BDC/COELSA)",
        icon: Zap,
        disabled: !puedeModificar,
        onClick: async () => {
          const cuit = (row.cliente?.cuit ?? "").replace(/\D/g, "");
          if (!row.legajo || !cuit) {
            toast.error("No se pudo identificar el titular (legajo o CUIT faltante).");
            return;
          }
          const result = await asignarCvuParaExistente({
            cliente: {
              id: row.id,
              legajo: row.legajo,
              correo: row.cliente?.correo ?? row.email ?? "",
              cuit,
              nombre: `${row.nombre} ${row.apellido}`.trim() || row.nombre,
              tipoPersona: row.cliente?.tipoPersona === "juridica" ? "juridica" : "fisica",
            },
            subcuentaId: row.id,
            tipo: row.tipo,
            origin: "admin",
          });
          if (result.kind === "rechazado") {
            return;
          }
          invalidar(row.clienteLegajo);
        },
      });
    }

    items.push({
      label: "Editar",
      icon: Edit3,
      disabled: !puedeModificar,
      onClick: () => {
        setEditTarget(row);
        setEditAlias(row.cbu?.slice(-6) ?? "");
      },
    });

    items.push({
      label: row.estado === "Activa" ? "Deshabilitar" : "Habilitar",
      icon: XCircle,
      variant: row.estado === "Activa" ? ("danger" as const) : undefined,
      disabled: !puedeModificar,
      onClick: async () => {
        try {
          await updateSubcuenta(row.clienteLegajo, row.id, {
            estado: row.estado === "Activa" ? "Pausada" : "Activa",
          });
          invalidar(row.clienteLegajo);
        } catch (e) {
          toast.error((e as Error).message);
        }
      },
    });

    return items;
  };

  return {
    getActions,
    puedeCrear,
    viewing,
    setViewing,
    editTarget,
    setEditTarget,
    editAlias,
    setEditAlias,
    guardarEdicion,
  };
}
