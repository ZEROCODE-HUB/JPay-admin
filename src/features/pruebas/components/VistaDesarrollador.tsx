import { FileCog, Play, RotateCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { Card, BtnOutline } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import type { Integracion } from "@/lib/api/types";
import type { ControlesTecnicos } from "../hooks/useControlesTecnicos";
import { ControlesTecnicosDialogs } from "./ControlesTecnicosDialogs";

/** Vista técnica del gestor de integraciones con datos de referencia (solo pruebas). */
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
        <p className="text-sm text-muted-foreground">
          Vista técnica del gestor de integraciones. Requiere permiso de lectura sobre
          "gestor_integraciones".
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
