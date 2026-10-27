import { DataAccessError } from "@/lib/api/errors";
import type { CodigoCategoria } from "@/lib/api/types";

export const PAGE_SIZE = 25;

export type EstadoCategoria = "activo" | "inactivo";

export type CategoriaForm = {
  codigo: string;
  nombre: string;
  descripcion: string;
};

/** Valores iniciales del formulario (alta o edición). */
export function categoriaFormInicial(categoria: CodigoCategoria | null): CategoriaForm {
  return {
    codigo: categoria?.codigo ?? "",
    nombre: categoria?.nombre ?? "",
    descripcion: categoria?.descripcion ?? "",
  };
}

/** Código y nombre son obligatorios. */
export function categoriaFormValido(form: CategoriaForm): boolean {
  return form.codigo.trim() !== "" && form.nombre.trim() !== "";
}

/** Mensaje del diálogo de error al guardar (detecta el código duplicado). */
export function mensajeErrorGuardado(e: unknown, codigo: string): string {
  const isDuplicado =
    e instanceof DataAccessError && (e.code === "23505" || /duplicat|unique/i.test(e.message));
  return isDuplicado
    ? `Ya existe otra categoría con el código "${codigo.trim()}". El código debe ser único.`
    : (e as Error).message;
}
