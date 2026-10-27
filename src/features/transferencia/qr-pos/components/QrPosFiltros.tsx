import type { EstadoQr } from "@/lib/api/types";
import { ESTADOS_QR } from "../estados";

export function QrPosFiltros({
  search,
  onSearchChange,
  estado,
  onEstadoChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  estado: EstadoQr | "";
  onEstadoChange: (v: EstadoQr | "") => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <input
        className="h-10 px-3 rounded-md border bg-card text-sm flex-1 min-w-[200px]"
        placeholder="Buscar QR, comercio, cajero..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select
        className="h-10 px-3 rounded-md border bg-card text-sm"
        value={estado}
        onChange={(e) => onEstadoChange(e.target.value as EstadoQr | "")}
      >
        <option value="">Todos los estados</option>
        {ESTADOS_QR.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
    </div>
  );
}
