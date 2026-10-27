import { Badge } from "@/components/portal-shell";
import { useCan } from "@/lib/permissions";
import type { Cliente } from "@/lib/api/types";
import { estadoLabel, estadoTone, type ConfirmActionState } from "../utils";
import type { AccionCliente } from "../hooks/useClienteAcciones";

/** Badge de estado + botones de transición de estado del cliente. */
export function ClienteAcciones({
  cliente,
  setConfirmAction,
  cambiarEstadoHomologado,
}: {
  cliente: Cliente;
  setConfirmAction: (a: ConfirmActionState | null) => void;
  cambiarEstadoHomologado: (c: Cliente, accion: AccionCliente) => Promise<void>;
}) {
  const { can } = useCan();
  const puedeModificar = can("modificar", "usuarios");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        tone={
          (estadoTone[cliente.estado] ?? "neutral") as "success" | "danger" | "warn" | "neutral"
        }
      >
        {estadoLabel[cliente.estado] ?? cliente.estado}
      </Badge>
      {(() => {
        const norm = (cliente.estado as string).toLowerCase();
        const isRegistrado = norm === "registrado";
        const isPreactivado = norm === "preactivado";
        const isActivado = norm === "activado" || norm === "activo";
        const isSuspendido = norm === "suspendido";
        const isTerminal = norm === "deshabilitado" || norm === "eliminado" || norm === "rechazado";
        return (
          <>
            {isRegistrado && puedeModificar && (
              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    title: "Aprobar documentación",
                    message: `¿Aprobar la documentación de ${cliente.nombre}? Pasará a Preactivado.`,
                    confirmLabel: "Aprobar",
                    variant: "default",
                    onConfirm: () => {
                      setConfirmAction(null);
                      void cambiarEstadoHomologado(cliente, "aprobar");
                    },
                  })
                }
                className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
              >
                Aprobar documentación
              </button>
            )}
            {isPreactivado && puedeModificar && (
              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    title: "Activar usuario",
                    message: `¿Activar a ${cliente.nombre}? Requiere CVU y comisión cargados.`,
                    confirmLabel: "Activar",
                    variant: "default",
                    onConfirm: () => {
                      setConfirmAction(null);
                      void cambiarEstadoHomologado(cliente, "activar");
                    },
                  })
                }
                className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
              >
                Activar
              </button>
            )}
            {isActivado && puedeModificar && (
              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    title: "Suspender cliente",
                    message: `¿Suspender a ${cliente.nombre}? Se conservará su historial.`,
                    confirmLabel: "Suspender",
                    variant: "danger",
                    onConfirm: () => {
                      setConfirmAction(null);
                      void cambiarEstadoHomologado(cliente, "suspender");
                    },
                  })
                }
                className="inline-flex h-9 items-center rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground hover:bg-accent"
              >
                Suspender
              </button>
            )}
            {isSuspendido && puedeModificar && (
              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    title: "Reactivar cliente",
                    message: `¿Reactivar a ${cliente.nombre}?`,
                    confirmLabel: "Reactivar",
                    variant: "default",
                    onConfirm: () => {
                      setConfirmAction(null);
                      void cambiarEstadoHomologado(cliente, "reactivar");
                    },
                  })
                }
                className="inline-flex h-9 items-center rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground hover:bg-accent"
              >
                Reactivar
              </button>
            )}
            {!isTerminal && puedeModificar && (
              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    title: "Deshabilitar usuario",
                    message: `¿Deshabilitar a ${cliente.nombre}? Se cancelará su CVU y se conservará el historial (auditoría BCRA).`,
                    confirmLabel: "Deshabilitar",
                    variant: "danger",
                    onConfirm: () => {
                      setConfirmAction(null);
                      void cambiarEstadoHomologado(cliente, "deshabilitar");
                    },
                  })
                }
                className="inline-flex h-9 items-center rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground hover:bg-accent"
              >
                Deshabilitar
              </button>
            )}
            {!isTerminal && (
              <button
                type="button"
                disabled={!can("borrar", "usuarios")}
                onClick={() =>
                  setConfirmAction({
                    title: "Eliminar usuario",
                    message: `¿Eliminar a ${cliente.nombre}? Solo permitido si nunca tuvo movimientos.`,
                    confirmLabel: "Eliminar",
                    variant: "danger",
                    onConfirm: () => {
                      setConfirmAction(null);
                      void cambiarEstadoHomologado(cliente, "eliminar");
                    },
                  })
                }
                className="inline-flex h-9 items-center rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
              >
                Eliminar
              </button>
            )}
          </>
        );
      })()}
    </div>
  );
}
