import { Database, Layers, ServerCog, Timer } from "lucide-react";
import { Card } from "@/components/portal-shell";
import { proximoGrupo } from "../utils";

/** Estado del servicio, conexiones y estadísticas paralelas (datos de referencia). */
export function InfraestructuraCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ServerCog size={18} className="text-secondary" />
          <h3 className="font-display font-semibold">Estado del Servicio</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Servicio</span>
            <span className="font-mono text-xs font-semibold">ms-login-providers</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Versión</span>
            <span className="font-mono text-xs">1.24.7</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Cron</span>
            <span className="font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Ejecutándose
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Database size={18} className="text-secondary" />
          <h3 className="font-display font-semibold">Conexiones</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Redis</span>
            <span className="font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Conectado
            </span>
          </div>
          <div className="font-mono text-[11px] text-muted-foreground -mt-2 pb-2 border-b">
            redis://redis.internal:6379
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Base de Datos</span>
            <span className="font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Conectada
            </span>
          </div>
          <div className="font-mono text-[11px] text-muted-foreground -mt-2 pb-2 border-b">
            postgres://db.internal:5432/app
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Servicio de login</span>
            <span className="font-mono text-[11px] font-semibold">login.internal:8083</span>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-secondary" />
            <h3 className="font-display font-semibold">Estadísticas paralelas</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Total de logins</span>
              <span className="font-semibold tabular-nums">6</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Grupos de ejecución</span>
              <span className="font-semibold tabular-nums">2</span>
            </div>
            <div className="py-2">
              <div className="text-muted-foreground">Próximo grupo a ejecutar</div>
              <div className="mt-2 rounded-lg bg-muted/50 p-3">
                <div className="font-semibold flex items-center gap-1.5">
                  <Timer size={14} className="text-secondary" /> Grupo A — en 45 s
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {proximoGrupo.map((l) => (
                    <span
                      key={l}
                      className="font-mono text-[11px] bg-card border border-border rounded px-1.5 py-0.5"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
