import { Download, Upload } from "lucide-react";
import { brand } from "@/brand/brand";
import { BtnOutline, BtnPrimary, PageHeader } from "@/components/portal-shell";
import { CargarCsvModal } from "@/components/cargar-csv-modal";
import { ConfirmarAcreditacionModal } from "@/components/confirmar-acreditacion-modal";
import { PermissionGuard } from "@/components/permission-guard";
import { useLotesAcciones } from "../hooks/useLotesAcciones";
import { useLotesData } from "../hooks/useLotesData";
import { useLotesFiltros } from "../hooks/useLotesFiltros";
import { ComercioDetalleModal } from "./ComercioDetalleModal";
import { ContracargoModal } from "./ContracargoModal";
import { LoteDetalleModal } from "./LoteDetalleModal";
import { LotesContenido } from "./LotesContenido";
import { LotesFiltros } from "./LotesFiltros";
import { LotesKpis } from "./LotesKpis";

/** Pantalla "Lotes de Acreditación" de links de pago. */
export function LotesPage() {
  const f = useLotesFiltros();
  const d = useLotesData(f);
  const a = useLotesAcciones(f);

  return (
    <PermissionGuard recurso="comercios">
      <PageHeader
        title="Lotes de Acreditación"
        description={`Corte diario generado por ${brand.name} por bandera: Programado → (Subir CSV) → Pendiente → (Acreditar) → Acreditado.`}
        action={
          <div className="flex flex-wrap gap-2">
            <BtnOutline onClick={a.exportarCsv} disabled={a.exportando}>
              {a.exportando ? (
                <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              ) : (
                <Download size={14} />
              )}
              Descargar CSV
            </BtnOutline>
            {a.puedeGestionar && (
              <BtnPrimary
                onClick={() => a.setCargarCsv({ lote: null })}
                disabled={a.tab !== "lotes"}
                title={a.tab !== "lotes" ? "Cambiá a la pestaña Lotes por bandera" : undefined}
              >
                <Upload size={14} />
                Subir CSV de Payway
              </BtnPrimary>
            )}
          </div>
        }
      />

      <LotesKpis resumen={d.resumen} />
      <LotesFiltros f={f} opcionesBandera={d.opcionesBandera} comercios={d.comerciosOptions} />
      <LotesContenido f={f} d={d} a={a} />

      {a.detail && (
        <LoteDetalleModal
          lote={a.detail}
          onClose={() => a.setDetail(null)}
          onSubirCsv={a.onSubirCsv}
        />
      )}

      {a.cargarCsv && (
        <CargarCsvModal
          open={!!a.cargarCsv}
          lote={a.cargarCsv.lote}
          onClose={() => a.setCargarCsv(null)}
          onCargado={a.handleCsvCargado}
        />
      )}

      {a.confirmarAcreditacion && (
        <ConfirmarAcreditacionModal
          lote={a.confirmarAcreditacion}
          onClose={() => a.setConfirmarAcreditacion(null)}
          onAcreditado={a.handleAcreditado}
        />
      )}

      {a.comercioDetail && (
        <ComercioDetalleModal
          data={a.comercioDetail}
          lotes={d.lotes}
          onClose={() => a.setComercioDetail(null)}
        />
      )}

      {a.contracargoModal && (
        <ContracargoModal
          draft={a.contracargoModal}
          onChange={a.setContracargoModal}
          onClose={() => a.setContracargoModal(null)}
          onConfirm={() => a.handleContracargo()}
        />
      )}
    </PermissionGuard>
  );
}
