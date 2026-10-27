import type { BankRow } from "@/lib/conciliacion/parse";
import type { AnalisisResumen, CruceItem } from "@/lib/conciliacion/engine";

/** Archivo de conciliación bancaria tal como se lista en la pantalla. */
export type Archivo = {
  archivo: string;
  fecha: string;
  estado: "Analizado" | "Pendiente";
  downloadRows: Record<string, unknown>[];
  bankRows?: BankRow[];
  rawFile?: File | null;
  storagePath?: string | null;
};

/** Fallback: convierte las filas de descarga (mock) al shape mínimo de BankRow. */
export function downloadRowsToBankRows(downloadRows: Record<string, unknown>[]): BankRow[] {
  return downloadRows.map((r) => ({
    fechaNegocio: String(r["FECHA_NEGOCIO"] ?? ""),
    idDebin: String(r["ID_DEBIN"] ?? ""),
    tipoMovCoelsa: String(r["TIPO_MOV_COELSA"] ?? ""),
    cbu: String(r["CBU"] ?? ""),
    ctaBtDelCbu: "",
    btSbo: "",
    btTop: "",
    denominacion: "",
    cuit: "",
    importeRaw: String(r["IMPORTE_COELSA"] ?? "0"),
    importeCoelsa: Number(r["IMPORTE_COELSA"] ?? 0),
    estadoCoelsa: String(r["ESTADO_COELSA"] ?? "COMPLETADA"),
    astoEstado: String(r["ASTO_ESTADO"] ?? ""),
    cvu: String(r["CVU"] ?? ""),
    cuitVirtual: "",
    cvu2: "",
    cuitVirtual2: "",
    cbu2: "",
    cuit2: "",
    concepto: "",
    mismoTit: "",
    detalle: "",
    cvuCredito: "",
    fechaHoraCoelsa: String(r["FECHA_HORA_COELSA"] ?? ""),
    raw: r as Record<string, string>,
  }));
}

export type RangoConciliacion = {
  desde: string | undefined;
  hasta: string;
  rangoLabel: string;
};

/**
 * Rango incremental de movimientos de plataforma a cruzar con un archivo:
 * el 1er reporte = todo hasta la fecha de carga; los siguientes = (fecha del
 * reporte anterior + 1 día, fecha actual 23:59:59.999].
 */
export function calcularRangoConciliacion(
  archivo: Pick<Archivo, "archivo" | "fecha">,
  allArchivos: Pick<Archivo, "archivo" | "fecha">[],
): RangoConciliacion {
  const sorted = [...allArchivos].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const idx = sorted.findIndex((a) => a.archivo === archivo.archivo);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  let desde: string | undefined;
  let hasta: string;
  let rangoLabel: string;
  if (prev) {
    const dPrev = new Date(prev.fecha + "T00:00:00");
    dPrev.setDate(dPrev.getDate() + 1);
    desde = dPrev.toISOString();
    hasta = new Date(archivo.fecha + "T00:00:00").toISOString();
    // incluir todo el día hasta 23:59
    const h = new Date(hasta);
    h.setHours(23, 59, 59, 999);
    hasta = h.toISOString();
    rangoLabel = `${prev.fecha} → ${archivo.fecha} (delta)`;
  } else {
    // primer reporte: histórico hasta fecha carga
    hasta = new Date(archivo.fecha + "T00:00:00").toISOString();
    const h = new Date(hasta);
    h.setHours(23, 59, 59, 999);
    hasta = h.toISOString();
    desde = undefined;
    rangoLabel = `histórico hasta ${archivo.fecha}`;
  }
  return { desde, hasta, rangoLabel };
}

/** Porcentaje de éxito con 2 decimales (0 si no hay resumen o total 0). */
export function porcentajeExito(resumen: Pick<AnalisisResumen, "total" | "encontrados"> | null) {
  return resumen
    ? resumen.total > 0
      ? Math.round((resumen.encontrados / resumen.total) * 10000) / 100
      : 0
    : 0;
}

/** CSV del cruce banco ↔ plataforma (separador coma, filas con \n). */
export function buildCruceCsv(items: CruceItem[]): string {
  const rows = items.map((it) => ({
    ID_DEBIN: it.bankRow.idDebin,
    TIPO: it.bankRow.tipoMovCoelsa,
    IMPORTE_BANCO: it.bankRow.importeCoelsa,
    ESTADO_BANCO: it.bankRow.estadoCoelsa,
    id_txn_plataforma: it.movimiento?.idTxn ?? "",
    monto_plataforma: it.movimiento?.montoOperacion ?? "",
    estado_cruce: it.estado,
    detalle: it.detalle,
  }));
  const cols = Object.keys(rows[0] ?? {});
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    cols.join(","),
    ...rows.map((r) => cols.map((c) => esc((r as Record<string, unknown>)[c])).join(",")),
  ].join("\n");
}

export function nombreCruceCsv(archivo: string): string {
  return `cruce_${archivo.replace(/\.[^.]+$/, "")}.csv`;
}
