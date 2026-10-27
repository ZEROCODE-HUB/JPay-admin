/** Período corriente "AAAA-MM" (valor de `<input type="month">`; el nombre del padrón quita el guion). */
export function periodoActual(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Primer día del mes en curso como "01/MM/AAAA" (período "En curso" de comisiones). */
export function periodoEnCurso(d: Date = new Date()): string {
  const pm = String(d.getMonth() + 1).padStart(2, "0");
  return `01/${pm}/${d.getFullYear()}`;
}

/** CUIT de consulta: solo dígitos, máx 11. */
export function normalizarCuit(v: string): string {
  return v.replace(/\D/g, "").slice(0, 11);
}

export function esCuitValido(cuit: string): boolean {
  return /^\d{11}$/.test(cuit);
}
