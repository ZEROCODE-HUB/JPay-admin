import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/portal-shell";
import type { ClienteSelect } from "@/lib/api/types";

/**
 * Buscador de cliente para el alta de comercio. Las opciones vienen ya filtradas
 * del servidor (debounce en el padre); al elegir una se completa legajo y usuario.
 */
export function ClienteCombobox({
  opciones,
  busqueda,
  hayBusqueda,
  clienteLegajo,
  clienteSeleccionado,
  onBusquedaChange,
  onLimpiar,
  onElegir,
}: {
  opciones: ClienteSelect[];
  busqueda: string;
  hayBusqueda: boolean;
  clienteLegajo: string;
  clienteSeleccionado: ClienteSelect | null;
  onBusquedaChange: (v: string) => void;
  onLimpiar: () => void;
  onElegir: (c: ClienteSelect) => void;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          id="gc-cliente"
          value={busqueda}
          onChange={(e) => {
            onBusquedaChange(e.target.value);
            setAbierto(true);
            if (!e.target.value.trim()) onLimpiar();
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 150)}
          placeholder="Buscar por nombre, legajo o correo…"
          className="pl-9"
          autoComplete="off"
        />
      </div>
      {abierto && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-input bg-card shadow-lg max-h-60 overflow-auto">
          {opciones.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {hayBusqueda ? "Sin resultados." : "Escribí para buscar (máx. 20 resultados)."}
            </div>
          ) : (
            opciones.map((c) => (
              <button
                key={c.legajo}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onElegir(c);
                  setAbierto(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent flex flex-col ${
                  c.legajo === clienteLegajo ? "bg-accent" : ""
                }`}
              >
                <span className="font-medium">{c.nombre}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {c.legajo} · {c.correo}
                </span>
              </button>
            ))
          )}
        </div>
      )}
      {clienteLegajo && clienteSeleccionado && (
        <p className="text-xs text-muted-foreground mt-1">
          Seleccionado: <span className="font-mono">{clienteSeleccionado.legajo}</span> ·{" "}
          {clienteSeleccionado.correo}
        </p>
      )}
    </div>
  );
}
