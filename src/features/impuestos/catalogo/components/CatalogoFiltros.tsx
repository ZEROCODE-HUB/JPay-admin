import { Input, Label } from "@/components/portal-shell";
import { FiltroEstado } from "../../components/FiltroEstado";
import type { CatalogoState } from "../hooks/useImpuestosCatalogo";
import type { TabAmbito } from "../utils";

function TabBtn({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
        activa
          ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

const contador = (n: number) => (n > 0 ? "(" + n + ")" : "");

/** Pestañas Externos / Internos + búsqueda y filtro de estado. */
export function CatalogoFiltros({ s }: { s: CatalogoState }) {
  const tab = (t: TabAmbito) => ({ activa: s.tab === t, onClick: () => s.cambiarTab(t) });
  return (
    <>
      <div className="flex gap-1 border-b border-border mb-4">
        <TabBtn {...tab("externos")}>Externos {contador(s.conteo.externos)}</TabBtn>
        <TabBtn {...tab("internos")}>Internos {contador(s.conteo.internos)}</TabBtn>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="buscar">Buscar</Label>
          <Input
            id="buscar"
            value={s.searchInput}
            onChange={(e) => s.cambiarBusqueda(e.target.value)}
            placeholder="Código, nombre o descripción…"
          />
        </div>
        <FiltroEstado value={s.estadoFilter} onChange={s.cambiarEstado} />
      </div>
    </>
  );
}
