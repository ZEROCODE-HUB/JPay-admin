import type { ParametroConfig } from "@/lib/api/detalle-cliente";
import type { ParamDef } from "../utils";

export function ParametrosResumen({
  defs,
  stored,
}: {
  defs: ParamDef[];
  stored: ParametroConfig[];
}) {
  if (defs.length === 0) {
    return <p className="text-xs text-muted-foreground">Sin parámetros configurados.</p>;
  }
  return (
    <ul className="space-y-2">
      {defs.map((d) => {
        const s = stored.find((p) => p.clave === d.clave);
        const habilitado = s?.habilitado ?? false;
        let valor = "No configurado";
        if (habilitado) {
          if (d.tipo === "switch") valor = "Habilitado";
          else if (d.tipo === "switch_valor")
            valor = `${s?.valor ?? d.valorDefecto ?? ""} ${d.unidad ?? ""}`.trim();
          else if (d.tipo === "switch_porcentaje")
            valor = `${s?.valor ?? d.valorDefecto ?? ""}${d.unidad ?? ""}`.trim();
          else if (d.tipo === "switch_cantidad_periodo")
            valor = `${s?.valor ?? d.valorDefecto ?? ""} cada ${
              s?.periodo ?? d.periodoDefecto ?? ""
            }`;
          else valor = "Habilitado";
        }
        return (
          <li key={d.clave} className="flex items-start justify-between gap-3 text-xs">
            <span className="text-muted-foreground">{d.etiqueta}</span>
            <span
              className={`font-medium text-right ${
                habilitado ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {valor}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
