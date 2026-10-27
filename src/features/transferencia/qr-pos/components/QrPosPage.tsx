import { AlertTriangle, Inbox } from "lucide-react";
import { DataTable } from "@/shared/ui/data-table";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Pagination } from "@/shared/ui/pagination";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { PAGE_SIZES } from "../utils";
import { useQrPosListado } from "../hooks/useQrPosListado";
import { useQrAcciones } from "../hooks/useQrAcciones";
import { qrPosColumns } from "./columns";
import { QrPosFiltros } from "./QrPosFiltros";
import { QrDetalle } from "./QrDetalle";

export function QrPosPage() {
  const l = useQrPosListado();
  const { detail, setDetail, confirm, setConfirm, getActions } = useQrAcciones();

  return (
    <PermissionGuard recurso="comercios">
      <PageHeader
        title="Pagos con QR"
        description="QRs/POS creados por comercios desde Enterprise. Payway activa; Admin gestiona estados."
      />
      <QrPosFiltros
        search={l.search}
        onSearchChange={l.cambiarSearch}
        estado={l.estado}
        onEstadoChange={l.cambiarEstado}
      />
      {l.isLoading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 text-sm text-muted-foreground">
          <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
          Cargando QRs…
        </div>
      ) : l.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-danger-200 bg-danger-50 px-6 py-12 text-center text-sm text-danger-700">
          <AlertTriangle size={28} />
          <p>{l.err?.message ?? "Error"}</p>
          <button
            onClick={() => l.refetch()}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground"
          >
            Reintentar
          </button>
        </div>
      ) : l.rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-12 text-sm text-muted-foreground">
          <Inbox size={28} />
          <p>No hay QRs/POS.</p>
          <p className="text-xs">
            Crea un QR en Enterprise → aparecerá aquí como Pendiente de aprobación.
          </p>
        </div>
      ) : (
        <>
          <DataTable
            columns={qrPosColumns}
            data={l.rows}
            keyExtractor={(r) => r.id}
            actions={(r) => <ActionsDropdown actions={getActions(r)} />}
            hidePagination
            showGlobalFilter={false}
          />
          <Pagination
            page={l.page + 1}
            totalPages={l.totalPages}
            pageSize={l.pageSize}
            total={l.total}
            countLabel="QR(s)"
            pageSizes={PAGE_SIZES}
            disabled={l.isFetching}
            onPageChange={(p) => l.setPage(p - 1)}
            onPageSizeChange={l.cambiarPageSize}
          />
        </>
      )}
      {detail && <QrDetalle qr={detail} onClose={() => setDetail(null)} />}
      {confirm && (
        <ConfirmDialog
          open={!!confirm}
          onClose={() => setConfirm(null)}
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          variant={confirm.variant}
          onConfirm={confirm.onConfirm}
        />
      )}
    </PermissionGuard>
  );
}
