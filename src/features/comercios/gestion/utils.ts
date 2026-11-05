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
};
