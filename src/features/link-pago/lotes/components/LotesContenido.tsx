import { AlertTriangle, Eye, Inbox, Upload } from "lucide-react";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { BtnPrimary } from "@/components/portal-shell";
import { DataAccessError } from "@/lib/api/errors";
import { DataTable } from "@/shared/ui/data-table";
import { Pagination } from "@/shared/ui/pagination";
import type { LotesAcciones } from "../hooks/useLotesAcciones";
import type { LotesData } from "../hooks/useLotesData";
import type { LotesFiltrosState } from "../hooks/useLotesFiltros";
import { PAGE_SIZES } from "../utils";
import { lotesColumns, resumenColumns } from "./columns";
import { LoteAcciones } from "./LoteAcciones";

function TabButton({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        activo
          ? "border-primary text-primary-ink"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/** Pestañas + grilla de lotes o resumen por comercio (con estados de carga/error/vacío). */
export function LotesContenido({
  f,
  d,
  a,
}: {
  f: LotesFiltrosState;
  d: LotesData;
  a: LotesAcciones;
}) {
  const err = d.error instanceof DataAccessError ? d.error : null;

  let cuerpo;
  if (d.isLoading) {
    cuerpo = (
      <div className="flex items-center justify-center rounded-xl border bg-card py-16 text-sm text-muted-foreground">
        <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
        Cargando lotes…
      </div>
    );
  } else if (d.isError) {
    cuerpo = (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-danger-200 bg-danger-50 px-6 py-12 text-center text-sm text-danger-700">
        <AlertTriangle size={28} />
        <p>{err?.message ?? "Error"}</p>
        <button
          onClick={() => d.refetch()}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground"
        >
          Reintentar
        </button>
      </div>
    );
  } else if (a.tab === "lotes" && d.lotes.length === 0) {
    cuerpo = (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        <Inbox size={28} />
        <p>No hay lotes que coincidan con los filtros.</p>
        {a.puedeGestionar && (
          <BtnPrimary onClick={() => a.setCargarCsv({ lote: null })}>
            <Upload size={14} />
            Subir CSV de Payway
          </BtnPrimary>
        )}
      </div>
    );
  } else if (a.tab === "lotes") {
    cuerpo = (
      <>
        <DataTable
          columns={lotesColumns}
          data={d.lotes}
          keyExtractor={(r) => r.id}
          actions={(r) => <LoteAcciones r={r} a={a} />}
          hidePagination
          showGlobalFilter={false}
        />
        <Pagination
          page={f.page + 1}
          totalPages={d.totalPages}
          pageSize={f.pageSize}
          total={d.total}
          countLabel="lotes"
          pageSizes={PAGE_SIZES}
          disabled={d.isFetching}
          onPageChange={(p) => f.setPage(p - 1)}
          onPageSizeChange={f.setPageSize}
        />
      </>
    );
  } else {
    cuerpo = (
      <>
        <p className="text-sm text-muted-foreground mb-3">
          Total consolidado que corresponde pagar a cada comercio (suma de todos sus lotes por
          bandera). Pendiente de acreditar = máximo adelantable. Agregación client-side sobre la
          página actual; para total global sin paginación usar query separada.
        </p>
        <DataTable
          columns={resumenColumns}
          data={d.resumenData}
          keyExtractor={(r) => r.comercioId}
          actions={(r) => (
            <ActionsDropdown
              actions={[{ label: "Ver detalle", icon: Eye, onClick: () => a.setComercioDetail(r) }]}
            />
          )}
          hidePagination
          showGlobalFilter={false}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex gap-2 mb-4 border-b">
        <TabButton activo={a.tab === "lotes"} onClick={() => a.setTab("lotes")}>
          Lotes por bandera
        </TabButton>
        <TabButton activo={a.tab === "resumen"} onClick={() => a.setTab("resumen")}>
          Resumen por comercio
        </TabButton>
      </div>
      {cuerpo}
    </>
  );
}
