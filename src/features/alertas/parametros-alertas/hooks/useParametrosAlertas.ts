import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listAlertRules, reglasDePais, saveAlertRules } from "@/lib/api/alert-rules";
import { CODES } from "../config";
import { construir, toDraft, type Draft } from "../utils";

/**
 * Carga, edición (borrador) y guardado de las reglas de alertas. `pais` null = valores generales
 * (Argentina); "MX" = los de México (montos en pesos mexicanos, UMAs, hora del centro).
 */
export function useParametrosAlertas() {
  const [pais, setPais] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    data: rules,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["alert_rules"],
    queryFn: listAlertRules,
  });

  const [draft, setDraft] = useState<Draft>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);

  const original = useMemo(
    () => (rules ? toDraft(reglasDePais(rules, pais)) : null),
    [rules, pais],
  );
  useEffect(() => {
    if (original) setDraft(structuredClone(original));
  }, [original]);

  const sinCambios = useMemo(
    () => JSON.stringify(original) === JSON.stringify(draft),
    [original, draft],
  );
  const faltantes = original ? CODES.filter((c) => !original[c]) : [];

  const patch = (code: string, fn: (d: Draft[string]) => void) =>
    setDraft((prev) => {
      const next = structuredClone(prev);
      if (next[code]) fn(next[code]);
      return next;
    });

  const guardar = async () => {
    const { rules: aGuardar, errores: errs } = construir(draft);
    setErrores(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Revisá los campos marcados antes de guardar");
      return;
    }
    setGuardando(true);
    try {
      await saveAlertRules(aGuardar, pais);
      await queryClient.invalidateQueries({ queryKey: ["alert_rules"] });
      toast.success("Configuración de alertas guardada");
    } catch (e) {
      toast.error(`No se pudo guardar: ${(e as Error).message}`);
    } finally {
      setGuardando(false);
    }
  };

  return {
    pais,
    setPais,
    isLoading,
    isError,
    error,
    refetch,
    draft,
    errores,
    guardando,
    sinCambios,
    faltantes,
    patch,
    guardar,
  };
}
