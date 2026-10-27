import type {
  AdelantoParaCalendario,
  CalendarioAcreditacion,
} from "@/lib/api/calendario-acreditaciones";
import { adelantoCerrado } from "./estados";

/** "2026-10-21" → Date local (sin corrimiento por zona horaria). */
export function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function fechaCorta(d: Date): string {
  return d.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

export function fechaLarga(fecha: string): string {
  return parseDateLocal(fecha).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function nombreMes(mes: number, anio: number): string {
  return new Date(anio, mes - 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
}

export type MesAnio = { mes: number; anio: number };

export function mesAnterior({ mes, anio }: MesAnio): MesAnio {
  return mes === 1 ? { mes: 12, anio: anio - 1 } : { mes: mes - 1, anio };
}

export function mesSiguiente({ mes, anio }: MesAnio): MesAnio {
  return mes === 12 ? { mes: 1, anio: anio + 1 } : { mes: mes + 1, anio };
}

export type DiaCalendario = {
  fecha: Date;
  esActual: boolean;
  esPasado: boolean;
  esOtroMes: boolean;
};

/** Días del mes en grilla 7×N (semana arranca el lunes, con relleno de meses vecinos). */
export function diasDelMes(mes: number, anio: number, today: Date): DiaCalendario[] {
  const primerDia = new Date(anio, mes - 1, 1);
  const ultimoDia = new Date(anio, mes, 0);
  const dias: DiaCalendario[] = [];
  let diaSemana = primerDia.getDay();
  diaSemana = diaSemana === 0 ? 6 : diaSemana - 1;
  for (let i = diaSemana - 1; i >= 0; i--) {
    dias.push({
      fecha: new Date(anio, mes - 1, -i),
      esActual: false,
      esPasado: false,
      esOtroMes: true,
    });
  }
  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    const fecha = new Date(anio, mes - 1, d);
    const esHoy =
      d === today.getDate() && mes === today.getMonth() + 1 && anio === today.getFullYear();
    dias.push({
      fecha,
      esActual: esHoy,
      esPasado: fecha < today && !esHoy,
      esOtroMes: false,
    });
  }
  const restante = 7 - (dias.length % 7);
  if (restante < 7) {
    for (let i = 1; i <= restante; i++) {
      dias.push({
        fecha: new Date(anio, mes, i),
        esActual: false,
        esPasado: false,
        esOtroMes: true,
      });
    }
  }
  return dias;
}

/**
 * Clave yyyy-mm-dd de una celda en fecha LOCAL. No usar `toISOString()`:
 * pasa a UTC y corre el día (p. ej. 23:30 en UTC-3 ya es el día siguiente).
 */
export function claveFecha(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

/** Nombres de bandera para el filtro, tomados del catálogo (sin repetidos, ordenados). */
export function nombresBanderas(catalogo: { nombre: string }[]): string[] {
  const nombres = catalogo.map((b) => b.nombre.trim()).filter((n) => n !== "");
  return Array.from(new Set(nombres)).sort((a, b) => a.localeCompare(b, "es"));
}

/** Indexa las acreditaciones por fecha de acreditación. */
export function agruparPorFecha(
  acreditaciones: CalendarioAcreditacion[],
): Map<string, CalendarioAcreditacion[]> {
  const map = new Map<string, CalendarioAcreditacion[]>();
  for (const a of acreditaciones) {
    const key = a.fechaAcreditacion;
    const existing = map.get(key) ?? [];
    existing.push(a);
    map.set(key, existing);
  }
  return map;
}

type ItemDia = Pick<
  CalendarioAcreditacion,
  | "importeBruto"
  | "importeNeto"
  | "cantidadOperaciones"
  | "adelantosReservadosTotal"
  | "adelantosAplicadosDia"
>;

/** Totales del modal de un día. */
export function totalesDia(items: ItemDia[]) {
  return {
    bruto: items.reduce((s, i) => s + i.importeBruto, 0),
    neto: items.reduce((s, i) => s + i.importeNeto, 0),
    adelantosReservados: items.reduce((s, i) => s + (i.adelantosReservadosTotal ?? 0), 0),
    operaciones: items.reduce((s, i) => s + i.cantidadOperaciones, 0),
  };
}

/** Resumen de una celda del calendario. */
export function resumenCelda(items: ItemDia[], minMonto: number) {
  const totalBruto = items.reduce((s, i) => s + i.importeBruto, 0);
  const totalAdelantos = items.reduce((s, i) => s + (i.adelantosAplicadosDia ?? 0), 0);
  const netoDespuesAdelantos = Math.max(
    items.reduce((s, i) => s + i.importeNeto, 0) - totalAdelantos,
    0,
  );
  const tieneAdelanto = totalAdelantos > 0;
  return {
    totalBruto,
    totalAdelantos,
    netoDespuesAdelantos,
    tieneAdelanto,
    cupoAgotado: tieneAdelanto && netoDespuesAdelantos < minMonto,
    operaciones: items.reduce((s, i) => s + i.cantidadOperaciones, 0),
  };
}

/** Neto del lote menos lo adelantado contra ese día (nunca negativo). */
export function netoDespuesAdelantos(
  it: Pick<CalendarioAcreditacion, "importeNeto" | "adelantosAplicadosDia">,
): number {
  return Math.max(it.importeNeto - (it.adelantosAplicadosDia ?? 0), 0);
}

/** % efectivo de la comisión de cierre sobre el bruto. */
export function comisionCierrePct(
  it: Pick<CalendarioAcreditacion, "importeBruto" | "comisionCierreLoteMonto">,
): number {
  return it.importeBruto > 0 ? (it.comisionCierreLoteMonto / it.importeBruto) * 100 : 0;
}

/** ¿El comercio tiene un adelanto Aprobado o Pendiente? */
export function tieneAdelantoActivo(adelantos: Pick<AdelantoParaCalendario, "estado">[]): boolean {
  return adelantos.some((a) => a.estado === "Aprobado" || a.estado === "Pendiente");
}

/** Adelantos que todavía comprometen el lote (ni acreditados, ni rechazados, ni cancelados). */
export function adelantosComprometidos<T extends Pick<AdelantoParaCalendario, "estado">>(
  adelantos: T[],
): T[] {
  return adelantos.filter((a) => !adelantoCerrado(a.estado));
}

/** Nombre de archivo seguro a partir del título de la fecha. */
export function nombreArchivoSeguro(titulo: string): string {
  return titulo.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 40);
}
