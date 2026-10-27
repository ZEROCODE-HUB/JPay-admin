/**
 * Documentos locales asignados a clientes de demostración.
 *
 * Las imágenes viven en `/public/imagenes` (son ilustraciones de ejemplo, sin datos reales) (servidas estáticamente por Vite) y
 * se muestran en la solapa "Documentos" de la ficha del cliente. Esto cubre el
 * requerimiento de asignar fotos a legajos específicos sin depender de la carga
 * por URL del backend.
 */
export type ImagenAsignada = {
  label: string;
  url: string;
};

// Vacío a propósito: eran legajos de ejemplo. Pendiente de conectar a la base.
export const IMAGENES_ASIGNADAS: Record<string, ImagenAsignada[]> = {};

export function imagenesParaLegajo(legajo: string): ImagenAsignada[] {
  return IMAGENES_ASIGNADAS[legajo.trim().toUpperCase()] ?? [];
}
