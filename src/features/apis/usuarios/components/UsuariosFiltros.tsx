import { Input, Label } from "@/components/portal-shell";
import type { EstadoApiUsuario } from "@/lib/api/types";
import { ESTADOS_API_USUARIO } from "@/lib/api/types";
import { SELECT_CLASS } from "../../listado";
import type { UsuariosApiState } from "../hooks/useUsuariosApi";

export function UsuariosFiltros({ s }: { s: UsuariosApiState }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="buscar">Buscar</Label>
        <Input
          id="buscar"
          value={s.searchInput}
          onChange={(e) => {
            s.setSearchInput(e.target.value);
            s.setPage(0);
          }}
          placeholder="Código, usuario o nombre…"
        />
      </div>
      <div>
        <Label htmlFor="f-estado">Estado</Label>
        <select
          id="f-estado"
          className={SELECT_CLASS}
          value={s.estadoFilter}
          onChange={(e) => {
            s.setEstadoFilter(e.target.value as EstadoApiUsuario | "");
            s.setPage(0);
          }}
        >
          <option value="">Todos</option>
          {ESTADOS_API_USUARIO.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
