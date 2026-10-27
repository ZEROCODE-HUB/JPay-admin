import type { EstadoComercio, NivelComercio } from "@/lib/api/types";

export const PAGE_SIZES = [10, 20, 50];

/** Datos que devuelve el formulario de alta/edición de comercio. */
export type ComercioFormInput = {
  clienteLegajo: string;
  usuario: string;
  nombreComercio: string | null;
  categoriaId: number | null;
  nivel: NivelComercio;
  estado: EstadoComercio;
  ejecutivoResponsableId: string | null;
  siteId: string | null;
};

/** Acepta vacío o un decimal con punto o coma (mientras se escribe). */
export function esDecimalEnEdicion(v: string): boolean {
  return v === "" || /^[0-9]*[.,]?[0-9]*$/.test(v);
}

/** Convierte un decimal con coma o punto a número; vacío o inválido = 0. */
export function parseDecimal(v: string): number {
  return parseFloat(v.replace(",", ".")) || 0;
}
