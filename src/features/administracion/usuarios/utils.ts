export const PAGE_SIZES = [10, 20, 50];

export type NuevoAdminUser = {
  nombre: string;
  email: string;
  legajo: string;
  password: string;
  rolId: string;
};

/**
 * Normaliza el formulario de alta (trim de nombre, email y legajo). Devuelve null
 * si falta nombre, email, contraseña o rol (el legajo es opcional).
 */
export function nuevoAdminUser(f: NuevoAdminUser): NuevoAdminUser | null {
  if (!f.nombre.trim() || !f.email.trim() || !f.password.trim() || !f.rolId) return null;
  return {
    nombre: f.nombre.trim(),
    email: f.email.trim(),
    legajo: f.legajo.trim(),
    password: f.password,
    rolId: f.rolId,
  };
}

/** Etiqueta del estado activo/inactivo de un usuario de backoffice. */
export function estadoAdminLabel(activo: boolean): string {
  return activo ? "Activo" : "Inactivo";
}
