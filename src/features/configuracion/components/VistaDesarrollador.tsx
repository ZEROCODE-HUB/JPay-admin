import { FileCog, Play, RotateCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { Card, Badge, BtnOutline } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import type { Integracion } from "@/lib/api/types";
import type { ControlesTecnicos } from "../hooks/useControlesTecnicos";
import { InfraestructuraCards } from "./InfraestructuraCards";
import { ControlesTecnicosDialogs } from "./ControlesTecnicosDialogs";

/** Vista técnica (modo desarrollador) del gestor de integraciones. */
export function VistaDesarrollador({
  controles,
  integraciones,
}: {
  controles: ControlesTecnicos;
  integraciones: Integracion[];
}) {
  return (
    <PermissionGuard recurso="gestor_integraciones">
      <div className="space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 text-sm text-amber-800 dark:text-amber-300">
          Vista de desarrollador: información técnica de infraestructura. Se accede con permiso
          "gestor_integraciones" (lectura sobre este recurso).{" "}
          <span className="font-semibold">Nota:</span> métricas operativas (semáforo, última/próxima
          ejecución, conexiones) son datos de REFERENCIA (mock) — provendrían de un sistema de
          monitoreo/cron real que aún no existe.
        </div>

        <InfraestructuraCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-secondary" />
              <h3 className="font-display font-semibold">Próxima ejecución</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">¿Ejecutaría ahora?</span>
                <Badge tone="warn">No — próxima corrida en 45 s</Badge>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Logins en paralelo</span>
                <span className="font-semibold tabular-nums">3</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <FileCog size={18} className="text-secondary" />
              <h3 className="font-display font-semibold">Controles técnicos</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <BtnOutline onClick={() => controles.setShowLogs(true)}>
                <FileCog size={15} /> Configurar Logs
              </BtnOutline>
              <BtnOutline onClick={() => controles.setConfirmEjecutarTodos(true)}>
                <Play size={15} /> Ejecutar Todos
              </BtnOutline>
              <BtnOutline onClick={() => controles.setShowEjecutarEspecifico(true)}>
                <Zap size={15} /> Ejecutar Específico
              </BtnOutline>
              <BtnOutline onClick={() => toast.success("Datos de integraciones actualizados")}>
                <RotateCw size={15} /> Actualizar Datos
              </BtnOutline>
            </div>
          </Card>
        </div>

        <ControlesTecnicosDialogs controles={controles} integraciones={integraciones} />
      </div>
    </PermissionGuard>
  );
}
