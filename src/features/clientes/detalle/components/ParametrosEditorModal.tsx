import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import {
  upsertParametroAlerta,
  upsertParametroBloqueo,
  type ParametroConfig,
} from "@/lib/api/detalle-cliente";
import type { ParamDef } from "../utils";
import { Toggle } from "./Toggle";

export function ParametrosEditorModal({
  open,
  onClose,
  title,
  legajo,
  defs,
  stored,
  kind,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  legajo: string;
  defs: ParamDef[];
  stored: ParametroConfig[];
  kind: "alerta" | "bloqueo";
}) {
  const queryClient = useQueryClient();
  const [vals, setVals] = useState<
    Record<string, { habilitado: boolean; valor: string; periodo: string }>
  >({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (open && Object.keys(vals).length === 0) {
    const init: Record<string, { habilitado: boolean; valor: string; periodo: string }> = {};
    for (const d of defs) {
      const s = stored.find((p) => p.clave === d.clave);
      init[d.clave] = {
        habilitado: s ? s.habilitado : false,
        valor: s?.valor ?? d.valorDefecto ?? "",
        periodo: s?.periodo ?? d.periodoDefecto ?? "",
      };
    }
    setVals(init);
  }

  const guardar = async () => {
    setSaving(true);
    setErr(null);
    try {
      for (const d of defs) {
        const v = vals[d.clave];
        if (kind === "alerta") {
          await upsertParametroAlerta(legajo, d.clave, {
            habilitado: v.habilitado,
            valor: v.valor || null,
            periodo: v.periodo || null,
          });
        } else {
          await upsertParametroBloqueo(legajo, d.clave, {
            habilitado: v.habilitado,
            valor: v.valor || null,
            periodo: v.periodo || null,
          });
        }
      }
      await queryClient.invalidateQueries({
        queryKey: [kind === "alerta" ? "param_alertas" : "param_bloqueos", legajo],
      });
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalDialog open={open} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        {defs.map((d) => {
          const v = vals[d.clave] ?? { habilitado: false, valor: "", periodo: "" };
          return (
            <div key={d.clave} className="rounded-lg border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-medium text-foreground">{d.etiqueta}</span>
                <Toggle
                  enabled={v.habilitado}
                  onChange={(nv) =>
                    setVals((prev) => ({ ...prev, [d.clave]: { ...v, habilitado: nv } }))
                  }
                />
              </div>
              {(d.tipo === "switch_valor" ||
                d.tipo === "switch_porcentaje" ||
                d.tipo === "switch_cantidad_periodo") && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {d.tipo === "switch_cantidad_periodo" ? (
                    <>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          disabled={!v.habilitado}
                          value={v.valor}
                          onChange={(e) =>
                            setVals((prev) => ({
                              ...prev,
                              [d.clave]: { ...v, valor: e.target.value },
                            }))
                          }
                          className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Período
                        </label>
                        <input
                          type="text"
                          disabled={!v.habilitado}
                          value={v.periodo}
                          onChange={(e) =>
                            setVals((prev) => ({
                              ...prev,
                              [d.clave]: { ...v, periodo: e.target.value },
                            }))
                          }
                          placeholder="ej. 24h"
                          className="h-9 w-28 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-muted-foreground">
                        {d.tipo === "switch_porcentaje" ? "Porcentaje" : "Monto"}
                      </label>
                      <input
                        type="number"
                        disabled={!v.habilitado}
                        value={v.valor}
                        onChange={(e) =>
                          setVals((prev) => ({
                            ...prev,
                            [d.clave]: { ...v, valor: e.target.value },
                          }))
                        }
                        className="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
                      />
                      {d.unidad && (
                        <span className="text-xs text-muted-foreground">{d.unidad}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {err && <p className="text-sm text-danger-600">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-input px-3 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={saving}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </ModalDialog>
  );
}
