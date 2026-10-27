/** Lógica compartida por los listados de APIs externas (usuarios y endpoints). */

export const LISTADO_PAGE_SIZE = 10;

/** Clase del `<select>` nativo usado en filtros y formularios de APIs externas. */
export const SELECT_CLASS =
  "w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

/** Cantidad de páginas (mínimo 1) para un total de filas. */
export function totalPaginas(total: number, pageSize: number = LISTADO_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** True si el error de guardado es por clave única duplicada (Postgres 23505). */
export function esErrorDuplicado(err: { code?: string | null; message: string }): boolean {
  return err.code === "23505" || /duplicat|unique/i.test(err.message);
}

/** Diálogo de aviso / confirmación genérico que abren las acciones del listado. */
export type ConfirmAction = {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "default" | "danger";
  onConfirm: () => void;
};

/** Arma el diálogo de error ("Cerrar") con el mensaje del error capturado. */
export function dialogoError(
  title: string,
  error: unknown,
  onCerrar: () => void,
  message: string = (error as Error).message,
): ConfirmAction {
  return {
    title,
    message,
    confirmLabel: "Cerrar",
    variant: "danger",
    onConfirm: onCerrar,
  };
}
