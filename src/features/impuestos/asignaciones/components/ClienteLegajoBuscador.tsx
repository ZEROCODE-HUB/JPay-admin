import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/portal-shell";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useClientesForSelect } from "@/hooks/useComercios";
import { esLegajoValido, legajoDesdeBusqueda } from "../utils";

/**
 * Buscador de cliente por correo o legajo para el alta de una asignación.
 * Tipear un legajo completo también lo selecciona.
 */
export function ClienteLegajoBuscador({
  legajo,
  onLegajoChange,
}: {
  legajo: string;
  onLegajoChange: (legajo: string) => void;
}) {
  const [clienteSearchInput, setClienteSearchInput] = useState(legajo);
  const debouncedClienteSearch = useDebouncedValue(clienteSearchInput, 350);
  const { data: clientesFiltrados } = useClientesForSelect(debouncedClienteSearch);
  const clientesOptions = clientesFiltrados ?? [];
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const legajoValido = esLegajoValido(legajo);

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          id="as-legajo"
          value={clienteSearchInput}
          onChange={(e) => {
            const v = e.target.value;
            setClienteSearchInput(v);
            // si escribe legajo directo, sincroniza form
            const tipeado = legajoDesdeBusqueda(v);
            if (tipeado !== null) onLegajoChange(tipeado);
            setComboboxOpen(true);
          }}
          onFocus={() => setComboboxOpen(true)}
          onBlur={() => setTimeout(() => setComboboxOpen(false), 150)}
          placeholder="Buscar por correo o legajo…"
          className="pl-9"
          autoComplete="off"
        />
      </div>
      {comboboxOpen && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-input bg-card shadow-lg max-h-60 overflow-auto">
          {clientesOptions.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {debouncedClienteSearch
                ? "Sin resultados."
                : "Escribí correo o legajo para buscar (máx. 20)."}
            </div>
          ) : (
            clientesOptions.map((c) => (
              <button
                key={c.legajo}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onLegajoChange(c.legajo);
                  setClienteSearchInput(`${c.correo} · ${c.legajo}`);
                  setComboboxOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent flex flex-col ${c.legajo === legajo ? "bg-accent" : ""}`}
              >
                <span className="font-medium">{c.correo}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {c.legajo} · {c.nombre}
                </span>
              </button>
            ))
          )}
        </div>
      )}
      <p className="text-[11px] text-muted-foreground mt-1">
        Buscable por correo o legajo. Seleccioná un usuario de la lista.
      </p>
      {legajo && (
        <p className="text-[11px] text-muted-foreground mt-1">
          Seleccionado: <span className="font-mono">{legajo}</span>
        </p>
      )}
      {legajo.trim() !== "" && !legajoValido && (
        <p className="text-xs text-danger-600 mt-1">Formato inválido. Ej: LPF-20111111111.</p>
      )}
    </div>
  );
}
