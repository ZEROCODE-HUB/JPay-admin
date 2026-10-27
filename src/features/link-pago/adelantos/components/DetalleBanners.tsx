import type { PoolRecaudacion } from "@/lib/api/adelantos";
import { formatMoney } from "@/shared/format";

/** Tope disponible: banner contextual sólo en Pendiente/Aprobado. */
export function TopeBanner({ tope, importe }: { tope: number; importe: number }) {
  return (
    <div className="rounded-lg border bg-amber-50 border-amber-200 px-3 py-2 text-xs text-amber-800 flex items-center justify-between">
      <span>
        Tope disponible del comercio:{" "}
        <span className="font-mono font-semibold">{formatMoney(tope)}</span>
      </span>
      <span className="text-amber-700">
        Importe solicitado: <span className="font-mono font-semibold">{formatMoney(importe)}</span>
      </span>
    </div>
  );
}

/**
 * Pool de Recaudación: banner solo cuando el adelanto está Aprobado (es
 * el único caso donde se Acredita y se mueve plata desde el pool).
 */
export function PoolBanner({
  pool,
  insuficiente,
  importe,
}: {
  pool: PoolRecaudacion;
  insuficiente: boolean;
  importe: number;
}) {
  return (
    <div
      className={
        "rounded-lg border px-3 py-2 text-xs flex items-center justify-between " +
        (insuficiente
          ? "bg-danger-50 border-danger-300 text-danger-800"
          : "bg-sky-50 border-sky-200 text-sky-800")
      }
    >
      <span className="flex items-center gap-3">
        <span>
          Pool Recaudación:{" "}
          <span className="font-mono font-semibold">{formatMoney(pool.poolRecaudacionTotal)}</span>
        </span>
        <span>
          Adelantos en curso:{" "}
          <span className="font-mono font-semibold">{formatMoney(pool.adelantosEnCurso)}</span>
        </span>
        <span>
          Cupo disponible:{" "}
          <span className="font-mono font-semibold">{formatMoney(pool.cupoDisponiblePool)}</span>
        </span>
      </span>
      {insuficiente && (
        <span className="font-semibold">
          ⚠ Pool insuficiente para acreditar {formatMoney(importe)}
        </span>
      )}
    </div>
  );
}
