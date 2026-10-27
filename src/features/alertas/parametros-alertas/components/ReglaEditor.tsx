import type { MinorsPolicy } from "@/lib/api/alert-rules";
import { dayNames, POLITICAS, type RuleView } from "../config";
import type { Draft } from "../utils";
import { ErrorCampo, Toggle } from "./Toggle";

/** Switch + campos editables de una regla (números, política de menores u horarios). */
export function ReglaEditor({
  rv,
  d,
  errores,
  patch,
}: {
  rv: RuleView;
  d: Draft[string];
  errores: Record<string, string>;
  patch: (code: string, fn: (d: Draft[string]) => void) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{rv.switchLabel}</span>
        <Toggle
          label={rv.switchLabel}
          enabled={d.isEnabled}
          onClick={() =>
            patch(rv.code, (x) => {
              x.isEnabled = !x.isEnabled;
            })
          }
        />
      </div>

      {rv.numbers?.map((f) => {
        const id = `${rv.code}.${f.key}`;
        return (
          <div key={id}>
            <label htmlFor={id} className="block text-xs font-semibold text-muted-foreground mb-1">
              {f.label}
            </label>
            <input
              id={id}
              type="number"
              min={0}
              step={f.integer ? 1 : "any"}
              value={d.values[f.key] ?? ""}
              onChange={(e) =>
                patch(rv.code, (x) => {
                  x.values[f.key] = e.target.value;
                })
              }
              aria-invalid={Boolean(errores[id])}
              className={`w-full h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 ${errores[id] ? "border-danger-400" : "border-input"}`}
            />
            <ErrorCampo msg={errores[id]} />
          </div>
        );
      })}

      {rv.code === "minors_transfer_policy" && (
        <div>
          <label
            htmlFor="politica-menores"
            className="block text-xs font-semibold text-muted-foreground mb-1"
          >
            Política
          </label>
          <select
            id="politica-menores"
            value={d.policy ?? "block"}
            onChange={(e) =>
              patch(rv.code, (x) => {
                x.policy = e.target.value as MinorsPolicy;
              })
            }
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          >
            {POLITICAS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {rv.code === "unusual_hours" &&
        (d.days ?? []).map((day, i) => (
          <div key={day.day}>
            <div className="flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-foreground w-24">
                  {dayNames[day.day - 1]}
                </span>
                <Toggle
                  label={dayNames[day.day - 1]}
                  enabled={day.enabled}
                  onClick={() =>
                    patch(rv.code, (x) => {
                      x.days![i].enabled = !x.days![i].enabled;
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-semibold text-muted-foreground">Inicio</label>
                <input
                  type="time"
                  value={day.start}
                  disabled={!day.enabled}
                  onChange={(e) =>
                    patch(rv.code, (x) => {
                      x.days![i].start = e.target.value;
                    })
                  }
                  className="h-8 w-32 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
                />
              </div>
              <span className="text-xs text-muted-foreground">→</span>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-semibold text-muted-foreground">Fin</label>
                <input
                  type="time"
                  value={day.end}
                  disabled={!day.enabled}
                  onChange={(e) =>
                    patch(rv.code, (x) => {
                      x.days![i].end = e.target.value;
                    })
                  }
                  className="h-8 w-32 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
                />
              </div>
            </div>
            <ErrorCampo msg={errores[`unusual_hours.day${day.day}`]} />
          </div>
        ))}
    </div>
  );
}
