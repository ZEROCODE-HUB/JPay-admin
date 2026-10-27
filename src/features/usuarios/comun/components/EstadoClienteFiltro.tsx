import { FILTRO_ESTADOS_OPCIONES } from "@/lib/cliente-estados";

/** Select "Estado" que se inyecta en los filtros extra de la tabla de clientes. */
export function EstadoClienteFiltro({
  value,
  onChange,
}: {
  value: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">Estado</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:min-w-[180px] h-8 px-2 rounded-md border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-ring/40"
      >
        <option value="">Todos</option>
        {FILTRO_ESTADOS_OPCIONES.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
