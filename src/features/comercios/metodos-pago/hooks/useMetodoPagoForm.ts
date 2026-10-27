import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { listCuotasByBandera, type Bandera } from "@/lib/api/banderas";
import { agregarCuota, cuotasAForm, TIPOS_METODO, type MetodoPagoForm } from "../utils";

/** Estado del formulario del modal de método de pago (datos generales + cuotas). */
export function useMetodoPagoForm(metodo: Bandera | null, onSave: (m: MetodoPagoForm) => void) {
  const [nombre, setNombre] = useState(metodo?.nombre ?? "");
  const [tipo, setTipo] = useState(metodo?.tipo ?? TIPOS_METODO[0]);
  const [diasHabiles, setDiasHabiles] = useState(metodo?.diasHabilesAcreditacion ?? 1);
  const [estado, setEstado] = useState(metodo?.estado ?? "Activo");
  const [cuotas, setCuotas] = useState<MetodoPagoForm["cuotas"]>([]);
  const [loadingCuotas, setLoadingCuotas] = useState(false);
  const keyRef = useRef(1);

  useEffect(() => {
    if (metodo) {
      setLoadingCuotas(true);
      listCuotasByBandera(metodo.id)
        .then((cq) => {
          setCuotas(cuotasAForm(cq));
        })
        .finally(() => setLoadingCuotas(false));
    }
  }, [metodo]);

  const addCuota = () => {
    setCuotas((prev) => agregarCuota(prev, keyRef.current++));
  };

  const updateCuota = (key: number, field: string, value: string) =>
    setCuotas((prev) => prev.map((c) => (c.key === key ? { ...c, [field]: value } : c)));

  const removeCuota = (key: number) => setCuotas((prev) => prev.filter((c) => c.key !== key));

  const guardar = () => {
    if (nombre.trim() === "") {
      toast.error("El nombre es requerido");
      return;
    }
    onSave({
      id: metodo?.id,
      nombre: nombre.trim(),
      tipo,
      diasHabiles,
      estado,
      cuotas,
    });
  };

  return {
    nombre,
    setNombre,
    tipo,
    setTipo,
    diasHabiles,
    setDiasHabiles,
    estado,
    setEstado,
    cuotas,
    loadingCuotas,
    addCuota,
    updateCuota,
    removeCuota,
    guardar,
  };
}
