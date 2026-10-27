import { toDate } from "@/shared/format";

export type Actividad = {
  campo: string;
  valorAnterior: string;
  valorNuevo: string;
  fecha: string;
  hora: string;
  usuario: string;
};

/** Parsea "DD/MM/AAAA" a Date local; null si no matchea. */
export function parseFechaDMY(v: string): Date | null {
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(+m[3], +m[2] - 1, +m[1]);
}

/** Acepta "DD/MM/AAAA" (fechas de la actividad) o "AAAA-MM-DD" (`<input type="date">`). */
function parseFecha(v: string): Date | null {
  return parseFechaDMY(v) ?? toDate(v);
}

/** Filtra la actividad por rango [desde, hasta] (ambos inclusive). */
export function filtrarActividad(items: Actividad[], desde: string, hasta: string): Actividad[] {
  const d = desde ? parseFecha(desde) : null;
  const h = hasta ? parseFecha(hasta) : null;
  return items.filter((a) => {
    const f = parseFecha(a.fecha);
    if (!f) return !d && !h;
    return (!d || f >= d) && (!h || f <= h);
  });
}

export function actividadExcelRows(items: Actividad[]) {
  return items.map((a) => ({
    "Campo actualizado": a.campo,
    "Valor anterior": a.valorAnterior,
    "Valor nuevo": a.valorNuevo,
    "Fecha y hora": `${a.fecha} ${a.hora}`,
    "Actualizado por": a.usuario,
  }));
}
