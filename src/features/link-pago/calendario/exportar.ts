import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { brand } from "@/brand/brand";
import type { ExportDiaRow } from "@/lib/api/calendario-acreditaciones";
import { formatMoney } from "@/shared/format";
import { nombreArchivoSeguro } from "./utils";

import { getPais } from "@/shared/pais";
export function exportExcel(fechaTitulo: string, rows: ExportDiaRow[]) {
  const wb = XLSX.utils.book_new();
  const data = rows.map((r) => ({
    Lote: r.codigo,
    Comercio: r.nombreComercio ?? "—",
    Legajo: r.legajo,
    Bandera: r.bandera,
    Estado: r.estado,
    Operaciones: r.cantidadOperaciones,
    "Importe bruto": r.importeBruto,
    [`Comisión ${brand.name}`]: r.tasaPropiaMonto,
    "Comisión PayWay": r.tasaPaywayMonto,
    "Comisión cierre lote": r.comisionCierreLoteMonto,
    Impuestos: r.impuestos,
    Contracargo: r.contracargoMonto,
    "Importe neto": r.importeNeto,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, fechaTitulo.slice(0, 30));
  XLSX.writeFile(wb, `calendario_${nombreArchivoSeguro(fechaTitulo)}.xlsx`);
}

export function exportPdf(fechaTitulo: string, rows: ExportDiaRow[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(`Calendario de Acreditaciones — ${fechaTitulo}`, 14, 16);
  doc.setFontSize(9);
  doc.text(`Generado: ${new Date().toLocaleString(getPais().locale)}`, 14, 22);
  autoTable(doc, {
    startY: 28,
    head: [
      [
        "Lote",
        "Comercio",
        "Bandera",
        "Estado",
        "Ops",
        "Bruto",
        brand.name,
        "PayWay",
        "Cierre",
        "Impuestos",
        "Contracargo",
        "Neto",
      ],
    ],
    body: rows.map((r) => [
      r.codigo,
      r.nombreComercio ?? "—",
      r.bandera,
      r.estado,
      String(r.cantidadOperaciones),
      formatMoney(r.importeBruto),
      formatMoney(r.tasaPropiaMonto),
      formatMoney(r.tasaPaywayMonto),
      formatMoney(r.comisionCierreLoteMonto),
      formatMoney(r.impuestos),
      formatMoney(r.contracargoMonto),
      formatMoney(r.importeNeto),
    ]),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [33, 37, 41] },
  });
  doc.save(`calendario_${nombreArchivoSeguro(fechaTitulo)}.pdf`);
}
