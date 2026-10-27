export type JuridicaMock = {
  legajo: string;
  correo: string;
  razonSocial: string;
  tipo: "SA" | "SRL";
  estado: string;
  fechaRegistro: string;
  subcuentas: number;
  cuit: string;
};

/**
 * Personas jurídicas de referencia (la lista de usuario es mock; la ficha de
 * detalle resuelve contra este catálogo cuando el backend no tiene la fila).
 */
// Vacío a propósito: eran datos de ejemplo. Pendiente de conectar a la base.
export const JURIDICAS_MOCK: JuridicaMock[] = [];

export function findJuridicaMock(legajo: string): JuridicaMock | undefined {
  const norm = legajo.trim().toUpperCase();
  return JURIDICAS_MOCK.find((j) => j.legajo.toUpperCase() === norm);
}
