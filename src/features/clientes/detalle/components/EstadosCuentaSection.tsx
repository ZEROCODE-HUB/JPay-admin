import { useQuery } from "@tanstack/react-query";
import { descargarEstadoCuentaCliente, listEstadosCuentaCliente } from "@/lib/api/cobre";
import { InfoTip } from "@/shared/ui/info-tip";
import { EstadosCuentaPanel } from "@/shared/ui/estados-cuenta";
import { SectionCard } from "./SectionCard";

/** Estados de cuenta mensuales (PDF de Cobre) de las cuentas del cliente. */
export function EstadosCuentaSection({ legajo }: { legajo: string }) {
  const q = useQuery({
    queryKey: ["cobre", "estados-cuenta", legajo],
    queryFn: () => listEstadosCuentaCliente(legajo),
  });
  return (
    <SectionCard
      title={
        <>
          Estados de cuenta{" "}
          <InfoTip>
            El estado de cuenta mensual que emite Cobre de cada cuenta del cliente (pesos y, si los
            tiene, dólares). Se genera la primera vez que se pide y puede tardar unos segundos. El
            cliente también los descarga en su portal (Reportes).
          </InfoTip>
        </>
      }
    >
      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : q.error ? (
        <p className="text-sm text-danger-600">{(q.error as Error).message}</p>
      ) : (
        <EstadosCuentaPanel
          cuentas={q.data ?? []}
          descargar={(cuenta, periodo) => descargarEstadoCuentaCliente(legajo, cuenta, periodo)}
          vacio="El cliente todavía no tiene estados de cuenta (aparecen al cerrar el primer mes de su cuenta)."
        />
      )}
    </SectionCard>
  );
}
