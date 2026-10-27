/** Tono del badge de estado de un usuario de backoffice. */
export function estadoAdminTone(activo: boolean): "success" | "neutral" {
  return activo ? "success" : "neutral";
}
