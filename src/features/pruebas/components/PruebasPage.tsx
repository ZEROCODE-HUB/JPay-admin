import { AlertTriangle } from "lucide-react";
import { Card, PageHeader } from "@/components/portal-shell";
import { useIntegraciones } from "@/hooks/useIntegraciones";
import { usePaisesConfig } from "@/hooks/usePaises";
import { useControlesTecnicos } from "../hooks/useControlesTecnicos";
import { SimuladorDepositoSpei } from "./SimuladorDepositoSpei";
import { SimuladorPagoR2p } from "./SimuladorPagoR2p";
import { VistaDesarrollador } from "./VistaDesarrollador";

/**
 * Sistema → Herramientas de prueba. Junta TODO lo que es de pruebas o demostración (simuladores,
 * vistas con datos de referencia) para que las pantallas normales se vean como en producción.
 * Esta pantalla completa (y `src/features/pruebas/`) se elimina antes de salir a producción.
 */
export function PruebasPage() {
  const { proveedores, isLoading } = usePaisesConfig();
  const { rows: integraciones } = useIntegraciones({ page: 0, pageSize: 100 });
  const controles = useControlesTecnicos();

  const cobre = proveedores.find((p) => p.codigo === "cobre");
  // Los simuladores solo funcionan con Cobre en modo simulado (COBRE_MODO, el modo por defecto).
  const cobreSimulado =
    !!cobre && cobre.conexion.modo !== "prueba" && cobre.conexion.modo !== "produccion";

  return (
    <div className="space-y-4">
      <PageHeader
        title="Herramientas de prueba"
        description="Simuladores y vistas de referencia para probar la plataforma."
      />

      <div
        role="alert"
        className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 text-sm font-semibold text-amber-800 dark:text-amber-300"
      >
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        Todo lo de esta pantalla es solo para pruebas y se eliminará antes de salir a producción.
      </div>

      <Card>
        <h3 className="font-semibold">Simuladores de Cobre (SPEI)</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Mientras Cobre no entregue la instancia de prueba, la conexión funciona con el simulador
          (secreto COBRE_MODO). Estos botones generan los mismos avisos que mandaría Cobre.
        </p>
        {isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Cargando…</p>
        ) : !cobreSimulado ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {cobre
              ? "Cobre no está en modo simulado: los simuladores están deshabilitados."
              : "Cobre no está configurado en esta instalación."}
          </p>
        ) : null}
        <div className="mt-3 space-y-4">
          <SimuladorDepositoSpei habilitado={cobreSimulado} />
          <SimuladorPagoR2p habilitado={cobreSimulado} />
        </div>
      </Card>

      <div>
        <h3 className="font-semibold mb-3">Vista técnica de integraciones</h3>
        <VistaDesarrollador controles={controles} integraciones={integraciones} />
      </div>
    </div>
  );
}
