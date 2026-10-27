import { Input, Label } from "@/components/portal-shell";

/** Buscador + select de estado de los listados de APIs externas. */
export function ListadoFiltros<E extends string>({
  searchInput,
  onSearchChange,
  placeholder,
  estadoFilter,
  onEstadoChange,
  estados,
}: {
  searchInput: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  estadoFilter: E | "";
  onEstadoChange: (value: E | "") => void;
  estados: readonly E[];
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="buscar">Buscar</Label>
        <Input
          id="buscar"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      <div>
        <Label htmlFor="f-estado">Estado</Label>
        <select
          id="f-estado"
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          value={estadoFilter}
          onChange={(e) => onEstadoChange(e.target.value as E | "")}
        >
          <option value="">Todos</option>
          {estados.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
