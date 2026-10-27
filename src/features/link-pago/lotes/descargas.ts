import * as XLSX from "xlsx";
import { toast } from "sonner";
import { brand } from "@/brand/brand";
import { formatDate } from "@/shared/format";
import type { LoteAcreditacion, Movimiento } from "@/lib/api/types";
import { generarCsvLiquidacionTestParaLote } from "@/lib/liquidaciones/parse";
import {
  comisionCierrePct,
  legajoComercio,
  nombreComercio,
  parseDateLocal,
  tasasCalculadas,
} from "./utils";

/** Dispara la descarga de un archivo de texto en el navegador. */
export function descargarTexto(contenido: string, filename: string, type: string): void {
  const blob = new Blob([contenido], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Exporta el detalle del lote (incluye tasas de la DB y recalculadas) a Excel. */
export function exportarLoteXlsx(lote: LoteAcreditacion): void {
  const tasas = tasasCalculadas(lote);
  const esCuotas = (lote.cuotas ?? 1) > 1;
  const data = [
    { Campo: "Código", Valor: lote.codigo },
    { Campo: "Fecha estimada", Valor: formatDate(parseDateLocal(lote.fecha)) },
    {
      Campo: "Fecha cobro real",
      Valor: lote.fechaCobroReal ? formatDate(lote.fechaCobroReal) : "—",
    },
    { Campo: "Comercio", Valor: nombreComercio(lote) },
    { Campo: "Legajo", Valor: legajoComercio(lote) },
    { Campo: "Bandera", Valor: lote.bandera },
    { Campo: "Cuotas", Valor: esCuotas ? `${lote.cuotas}` : "Pago único" },
    { Campo: "Cantidad operaciones", Valor: lote.cantidadOperaciones },
    { Campo: "Importe bruto", Valor: lote.importeBruto },
    { Campo: "IVA", Valor: lote.ivaMonto ?? 0 },
    { Campo: "Ingresos Brutos (IIBB)", Valor: lote.iibbMonto ?? 0 },
    { Campo: "Impuesto Débito/Crédito", Valor: lote.debitoCreditoMonto ?? 0 },
    { Campo: "Total Impuestos (legacy)", Valor: lote.impuestos },
    { Campo: "Tasa PayWay (%)", Valor: lote.tasaPaywayPct },
    { Campo: "Tasa PayWay ($) [DB]", Valor: lote.tasaPaywayMonto },
    { Campo: "Tasa PayWay ($) [recalculada]", Valor: tasas.paywayMonto },
    { Campo: `Tasa ${brand.name} (%)`, Valor: lote.tasaPropiaPct },
    { Campo: `Tasa ${brand.name} ($) [DB]`, Valor: lote.tasaPropiaMonto },
    { Campo: `Tasa ${brand.name} ($) [recalculada]`, Valor: tasas.propiaMonto },
    { Campo: "Comisión cierre lote (%)", Valor: comisionCierrePct(lote) },
    { Campo: "Comisión cierre lote ($)", Valor: lote.comisionCierreLoteMonto ?? 0 },
    { Campo: "Contracargo", Valor: lote.contracargoMonto ?? 0 },
    { Campo: "Importe neto", Valor: lote.importeNeto },
    { Campo: "Estado", Valor: lote.estado },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Detalle Lote");
  XLSX.writeFile(wb, `lote_${lote.codigo}_${hoyIso()}.xlsx`);
}

/**
 * Genera un archivo de Payway coherente con el lote, para probar el flujo
 * Programado → Pendiente sin esperar al archivo real.
 *
 * El número de establecimiento que Payway usa en su archivo NO vive en
 * `comercio_establecimientos` (ese mapa es para resolver comercio desde
 * el CSV), sino en `comercios.site_id`: el identificador del sitio que el
 * banco le asignó al comercio. Lo leemos del embed que ya viene en el lote.
 *
 * El archivo se arma a partir de los movimientos reales del lote: una fila
 * por movimiento, con la fecha y el monto individuales. Si no hay
 * movimientos cargados todavía, se cae a una sola fila agregada con el
 * total del lote. Nunca se incluyen otros lotes u otras banderas.
 */
export function descargarCsvPrueba(lote: LoteAcreditacion, movs: Movimiento[]): void {
  const siteId = lote.comercio?.siteId?.trim();
  let aviso: string | null = null;
  if (!siteId) {
    aviso =
      "El comercio no tiene site_id cargado. El archivo se generó con un placeholder (00000000); cargalo en la ficha del comercio y volvé a bajar el CSV.";
  }
  const { filename, contenido } = generarCsvLiquidacionTestParaLote(
    {
      codigo: lote.codigo,
      fecha: lote.fecha,
      bandera: lote.bandera,
      importeBruto: lote.importeBruto,
      // Porcentaje PayWay (3 = 3%), NO el monto. El helper deriva
      // COSTO_DE_SERVICIO del CSV como -(bruto × pct / 100), igual que la UI.
      tasaPaywayPct: Number(lote.tasaPaywayPct) || 0,
      impuestos: lote.impuestos,
      costoPaywayPagoUnico: lote.costoPaywayPagoUnico,
      comercio: { siteId: siteId ?? null },
    },
    movs.map((m) => ({
      fecha: m.fecha,
      montoOperacion: Number(m.montoOperacion) || 0,
    })),
  );
  descargarTexto(contenido, filename, "text/csv;charset=utf-8");
  const cantFilas = Math.max(1, movs.length);
  toast.success(
    `CSV de prueba generado: ${filename} (${cantFilas} fila${cantFilas === 1 ? "" : "s"})`,
  );
  if (aviso) toast.warning(aviso, { duration: 8000 });
}

/** Nombre del archivo de exportación de la grilla. */
export function nombreExportLotes(): string {
  return `lotes_acreditacion_${hoyIso()}.csv`;
}
