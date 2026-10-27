/** Celda "PEP": Sí (resaltado) / No. */
export function PepCelda({ esPep }: { esPep: boolean }) {
  return esPep ? (
    <span className="inline-flex items-center justify-center w-7 h-5 rounded-md border text-xs font-semibold bg-danger-100 text-danger-800 border-danger-200">
      Sí
    </span>
  ) : (
    <span className="text-xs text-muted-foreground text-center w-7 inline-block">No</span>
  );
}
