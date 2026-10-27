import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { saveAlertRules } from "@/lib/api/alert-rules";
import { ALERT_RULES_KEY, useAlertRules } from "../../parametros-comun/useAlertRules";
import { REGLA_GLOBAL, generalesDeRegla, validarGenerales } from "../utils";

/** Umbrales generales de bloqueo (regla global): formulario, validación y guardado. */
export function useParametrosGenerales() {
  const queryClient = useQueryClient();
  const reglas = useAlertRules();
  const regla = reglas.data?.find((r) => r.code === REGLA_GLOBAL);
  const generales = generalesDeRegla(regla);
  const [params, setParams] = useState({ persona: "", empresa: "" });
  const [errGen, setErrGen] = useState<{ persona?: string; empresa?: string }>({});
  const [guardandoGen, setGuardandoGen] = useState(false);

  useEffect(() => {
    if (regla)
      setParams({
        persona: String(generales.persona ?? ""),
        empresa: String(generales.empresa ?? ""),
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regla?.updatedAt]);

  const genSinCambios =
    params.persona === String(generales.persona ?? "") &&
    params.empresa === String(generales.empresa ?? "");

  const guardarGenerales = async () => {
    if (!regla) return;
    const v = validarGenerales(params);
    setErrGen(v.errs);
    if (!v.ok) return;
    setGuardandoGen(true);
    try {
      await saveAlertRules([
        {
          code: REGLA_GLOBAL,
          isEnabled: regla.isEnabled,
          parameters: {
            ...regla.parameters,
            individual_min_wages: v.persona,
            company_min_wages: v.empresa,
          },
        },
      ]);
      await queryClient.invalidateQueries({ queryKey: ALERT_RULES_KEY });
      toast.success("Parámetros generales de bloqueos guardados");
    } catch (err) {
      toast.error(`No se pudo guardar: ${(err as Error).message}`);
    } finally {
      setGuardandoGen(false);
    }
  };

  return {
    reglas,
    regla,
    generales,
    params,
    setParams,
    errGen,
    guardandoGen,
    genSinCambios,
    guardarGenerales,
  };
}

export type ParametrosGenerales = ReturnType<typeof useParametrosGenerales>;
