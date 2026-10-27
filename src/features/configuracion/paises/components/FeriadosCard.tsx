import { Card } from "@/components/portal-shell";
import { useFeriados } from "@/hooks/usePaises";
import type { Pais } from "@/lib/api/paises";
import { formatDate } from "@/shared/format";

const hoyIso = () => new Date().toISOString().slice(0, 10);

/** Próximos días no hábiles del país (los usa el cálculo de días hábiles). */
export function FeriadosCard({ pais }: { pais: Pais }) {
  const { data = [], isLoading, error } = useFeriados(pais.codigo, hoyIso());
  return (
    <Card>
      <h3 className="font-semibold">Próximos días inhábiles · {pais.nombre}</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Además de sábados y domingos. Se cargan por migración (calendario bancario oficial).
      </p>
      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-danger-600">No se pudieron cargar los feriados.</p>
      ) : data.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No hay feriados cargados.</p>
      ) : (
        <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
          {data.map((f) => (
            <li key={f.fecha} className="flex justify-between gap-3 border-b border-border py-1">
              <span>{f.descripcion}</span>
              <span className="tabular-nums text-muted-foreground">{formatDate(f.fecha)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
