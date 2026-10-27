export type Impuesto = {
  id: string;
  reporte: string;
  periodo: string;
  tramo: string;
  creado: string;
  presentado: "Sí" | "No";
  pagado: "Sí" | "No";
  totalRegistros: number;
  totalMovimientos: number;
  totalMonto: string;
  totalRetenciones: string;
};

export function generarTxtImpuesto(r: Impuesto): string {
  return [
    `ID: ${r.id}`,
    `Reporte: ${r.reporte}`,
    `Periodo: ${r.periodo}`,
    `Tramo: ${r.tramo}`,
    `Fecha de creacion: ${r.creado}`,
    `Presentado: ${r.presentado}`,
    `Pagado: ${r.pagado}`,
    `Total registros: ${r.totalRegistros}`,
    `Total movimientos: ${r.totalMovimientos}`,
    `Total monto: ${r.totalMonto}`,
    `Total retenciones: ${r.totalRetenciones}`,
  ].join("\n");
}

export function generarXmlImpuesto(r: Impuesto): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<reporte_impuesto>",
    `  <id>${esc(r.id)}</id>`,
    `  <reporte>${esc(r.reporte)}</reporte>`,
    `  <periodo>${esc(r.periodo)}</periodo>`,
    `  <tramo>${esc(r.tramo)}</tramo>`,
    `  <fecha_creacion>${esc(r.creado)}</fecha_creacion>`,
    `  <presentado>${esc(r.presentado)}</presentado>`,
    `  <pagado>${esc(r.pagado)}</pagado>`,
    `  <total_registros>${r.totalRegistros}</total_registros>`,
    `  <total_movimientos>${r.totalMovimientos}</total_movimientos>`,
    `  <total_monto>${esc(r.totalMonto)}</total_monto>`,
    `  <total_retenciones>${esc(r.totalRetenciones)}</total_retenciones>`,
    "</reporte_impuesto>",
  ].join("\n");
}

/** Nuevo reporte (sin totales) generado desde el formulario. */
export function nuevoImpuesto(
  cantidadActual: number,
  form: { fecha: string; impuesto: string; tramo: string },
): Impuesto {
  return {
    id: `IMP-${String(cantidadActual + 1).padStart(4, "0")}`,
    reporte: form.impuesto,
    periodo: form.fecha.slice(0, 7),
    tramo: form.tramo,
    creado: form.fecha,
    presentado: "No",
    pagado: "No",
    totalRegistros: 0,
    totalMovimientos: 0,
    totalMonto: "$ 0",
    totalRetenciones: "$ 0",
  };
}
