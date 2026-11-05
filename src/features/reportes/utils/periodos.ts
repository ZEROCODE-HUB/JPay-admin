/** Primer día del mes en curso como "01/MM/AAAA" (período "En curso" de comisiones). */
export function periodoEnCurso(d: Date = new Date()): string {
  const pm = String(d.getMonth() + 1).padStart(2, "0");
  return `01/${pm}/${d.getFullYear()}`;
}
