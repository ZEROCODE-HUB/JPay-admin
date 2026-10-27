import { OPERACIONES } from "../utils";

const inputCls = "h-9 w-full rounded-md border border-input bg-card px-3 text-sm";

/** Filtros propios del listado (TXID, CUIT, CVU, operación, agrupar) dentro del panel del DataTable. */
export function FiltrosExtra({
  txid,
  onTxid,
  cuit,
  onCuit,
  cvu,
  onCvu,
  operacion,
  onOperacion,
  agrupar,
  onAgrupar,
}: {
  txid: string;
  onTxid: (v: string) => void;
  cuit: string;
  onCuit: (v: string) => void;
  cvu: string;
  onCvu: (v: string) => void;
  operacion: string;
  onOperacion: (v: string) => void;
  agrupar: boolean;
  onAgrupar: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1 min-w-[200px]">
        <label className="text-xs font-medium text-muted-foreground">TXID</label>
        <input
          value={txid}
          onChange={(e) => onTxid(e.target.value)}
          placeholder="ORD6LEN8..."
          className={`${inputCls} font-mono`}
        />
      </div>
      <div className="space-y-1 min-w-[150px]">
        <label className="text-xs font-medium text-muted-foreground">CUIT</label>
        <input
          value={cuit}
          onChange={(e) => onCuit(e.target.value)}
          placeholder="30719143659"
          className={`${inputCls} font-mono`}
        />
      </div>
      <div className="space-y-1 min-w-[220px]">
        <label className="text-xs font-medium text-muted-foreground">CVU / CBU</label>
        <input
          value={cvu}
          onChange={(e) => onCvu(e.target.value)}
          placeholder="0000003100..."
          className={`${inputCls} font-mono`}
        />
      </div>
      <div className="space-y-1 min-w-[180px]">
        <label className="text-xs font-medium text-muted-foreground">Operación</label>
        <select
          value={operacion}
          onChange={(e) => onOperacion(e.target.value)}
          className={inputCls}
        >
          <option value="">Todas</option>
          {OPERACIONES.map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-xs text-muted-foreground h-9">
        <input type="checkbox" checked={agrupar} onChange={(e) => onAgrupar(e.target.checked)} />
        Agrupar desglose por TXID
      </label>
    </div>
  );
}
