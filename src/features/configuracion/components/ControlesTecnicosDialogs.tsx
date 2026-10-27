import { toast } from "sonner";
import { FormDialog } from "@/shared/ui/form-dialog";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import type { Integracion } from "@/lib/api/types";
import type { ControlesTecnicos } from "../hooks/useControlesTecnicos";

const selectClass =
  "w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

/** Diálogos de "Configurar Logs", "Ejecutar Específico" y "Ejecutar Todos". */
export function ControlesTecnicosDialogs({
  controles: c,
  integraciones,
}: {
  controles: ControlesTecnicos;
  integraciones: Integracion[];
}) {
  return (
    <>
      <FormDialog
        open={c.showLogs}
        onClose={() => c.setShowLogs(false)}
        title="Configurar Logs"
        description="Nivel de registro del servicio ms-login-providers."
        submitLabel="Guardar"
        onSubmit={() => {
          c.setShowLogs(false);
          toast.success(`Nivel de log actualizado a ${c.logNivel}`);
        }}
      >
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">Nivel de log</label>
          <select
            value={c.logNivel}
            onChange={(e) => c.setLogNivel(e.target.value)}
            className={selectClass}
          >
            {["DEBUG", "INFO", "WARN", "ERROR"].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Retención (días)
          </label>
          <select
            value={c.logRetencion}
            onChange={(e) => c.setLogRetencion(e.target.value)}
            className={selectClass}
          >
            {["3", "7", "15", "30"].map((n) => (
              <option key={n} value={n}>
                {n} días
              </option>
            ))}
          </select>
        </div>
      </FormDialog>

      <FormDialog
        open={c.showEjecutarEspecifico}
        onClose={() => c.setShowEjecutarEspecifico(false)}
        title="Ejecutar Específico"
        description="Ejecutar manualmente un login configurado."
        submitLabel="Ejecutar"
        onSubmit={() => {
          c.setShowEjecutarEspecifico(false);
          toast.success(`Ejecución manual iniciada para ${c.loginSeleccionado}`);
        }}
      >
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">Login</label>
          <select
            value={c.loginSeleccionado}
            onChange={(e) => c.setLoginSeleccionado(e.target.value)}
            className={selectClass}
          >
            {integraciones.map((i) => (
              <option key={i.id} value={i.id}>
                {i.id} — {i.nombre}
              </option>
            ))}
          </select>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={c.confirmEjecutarTodos}
        onClose={() => c.setConfirmEjecutarTodos(false)}
        title="Ejecutar todos los logins"
        message="Se disparará una corrida manual de los 6 logins configurados. ¿Deseás continuar?"
        confirmLabel="Ejecutar todos"
        onConfirm={() => {
          toast.success("Corrida manual de todos los logins iniciada");
        }}
      />
    </>
  );
}
