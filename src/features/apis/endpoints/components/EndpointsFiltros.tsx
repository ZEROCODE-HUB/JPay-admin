import { Input, Label } from "@/components/portal-shell";
import type { EstadoEndpoint, GrupoEndpoint, MetodoHttp } from "@/lib/api/types";
import { ESTADOS_ENDPOINT, GRUPOS_ENDPOINT, METODOS_HTTP } from "@/lib/api/types";
import { SELECT_CLASS } from "../../listado";
import type { EndpointsApiState } from "../hooks/useEndpointsApi";

export function EndpointsFiltros({ s }: { s: EndpointsApiState }) {
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
          placeholder="Nombre, path o descripción…"
        />
      </div>
      <div>
        <Label htmlFor="f-estado">Estado</Label>
        <select
          id="f-estado"
          className={SELECT_CLASS}
          value={s.estadoFilter}
          onChange={(e) => {
            s.setEstadoFilter(e.target.value as EstadoEndpoint | "");
            s.setPage(0);
          }}
        >
          <option value="">Todos</option>
          {ESTADOS_ENDPOINT.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="f-grupo">Grupo</Label>
        <select
          id="f-grupo"
          className={SELECT_CLASS}
          value={s.grupoFilter}
          onChange={(e) => {
            s.setGrupoFilter(e.target.value as GrupoEndpoint | "");
            s.setPage(0);
          }}
        >
          <option value="">Todos</option>
          {GRUPOS_ENDPOINT.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="f-metodo">Método</Label>
        <select
          id="f-metodo"
          className={SELECT_CLASS}
          value={s.metodoFilter}
          onChange={(e) => {
            s.setMetodoFilter(e.target.value as MetodoHttp | "");
            s.setPage(0);
          }}
        >
          <option value="">Todos</option>
          {METODOS_HTTP.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
