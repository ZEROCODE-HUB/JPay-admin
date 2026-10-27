export const PAGE_SIZES = [10, 20, 50];

/** Monto del enlace/pago como número (o null si no vino). */
export function montoNumero(v: number | string | null | undefined): number | null {
  return v == null ? null : Number(v);
}

/** Cómo se nombra el enlace en los mensajes de confirmación. */
export function etiquetaEnlace(r: { url?: string | null; id: string }): string {
  return r.url ?? r.id;
}

/** Qué transiciones de estado ofrece el menú según el estado actual. */
export function accionesDisponibles(estado: string) {
  return {
    activar: estado !== "Activado",
    desactivar: estado !== "Desactivado",
    pagado: estado !== "Pagado",
    expirar: estado !== "Expirado" && estado !== "Cancelado",
    contracargo: estado !== "Contracargo",
    eliminar: estado !== "Eliminado" && estado !== "Expirado" && estado !== "Cancelado",
  };
}
