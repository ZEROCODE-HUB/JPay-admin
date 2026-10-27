import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createBandera,
  createBanderaCuota,
  deleteBandera,
  deleteBanderaCuota,
  listBanderas,
  listCuotasByBandera,
  updateBandera,
  updateBanderaCuota,
  type Bandera,
} from "@/lib/api/banderas";
import { planificarCuotas, type CuotaForm, type MetodoPagoForm } from "../utils";

/** Deja las cuotas de la bandera en `banderas_cuotas` como quedaron en el formulario. */
async function guardarCuotas(banderaId: string, cuotas: CuotaForm[]) {
  const originales = await listCuotasByBandera(banderaId);
  const plan = planificarCuotas(originales, cuotas);
  // Primero las bajas y cambios, así un N° de cuota liberado se puede reusar al crear.
  await Promise.all(plan.eliminar.map((id) => deleteBanderaCuota(id)));
  await Promise.all(plan.actualizar.map(({ id, ...v }) => updateBanderaCuota(id, v)));
  await Promise.all(plan.crear.map((v) => createBanderaCuota({ banderaId, ...v })));
}

/** Listado de métodos de pago (banderas) con alta, edición y baja. */
export function useMetodosPago() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Bandera[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ metodo: Bandera | null } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Bandera | null>(null);

  useEffect(() => {
    listBanderas()
      .then(setData)
      .catch(() => toast.error("Error cargando métodos de pago"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (m: MetodoPagoForm) => {
    try {
      // Valida las cuotas antes de tocar la bandera (lanza con un mensaje legible).
      planificarCuotas([], m.cuotas);
    } catch (e) {
      toast.error((e as Error).message);
      return;
    }
    try {
      if (m.id) {
        const updated = await updateBandera(m.id, {
          nombre: m.nombre,
          tipo: m.tipo,
          diasHabilesAcreditacion: m.diasHabiles,
          estado: m.estado as "Activo" | "Inactivo",
        });
        await guardarCuotas(m.id, m.cuotas);
        setData((prev) => prev.map((d) => (d.id === m.id ? updated : d)));
        toast.success("Método de pago actualizado");
      } else {
        const created = await createBandera({
          nombre: m.nombre,
          tipo: m.tipo,
          diasHabilesAcreditacion: m.diasHabiles,
        });
        await guardarCuotas(created.id, m.cuotas);
        setData((prev) => [...prev, created]);
        toast.success("Método de pago creado");
      }
      setModal(null);
      void queryClient.invalidateQueries({ queryKey: ["banderas"] });
    } catch {
      toast.error("Error al guardar método de pago");
    }
  };

  const handleDelete = async (b: Bandera) => {
    try {
      await deleteBandera(b.id);
      setData((prev) => prev.filter((d) => d.id !== b.id));
      void queryClient.invalidateQueries({ queryKey: ["banderas"] });
      setConfirmDelete(null);
      setModal(null);
      toast.success("Método de pago eliminado");
    } catch {
      toast.error("Error al eliminar método de pago");
    }
  };

  return {
    data,
    loading,
    modal,
    setModal,
    confirmDelete,
    setConfirmDelete,
    handleSave,
    handleDelete,
  };
}
