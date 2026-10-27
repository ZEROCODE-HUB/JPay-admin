import { useState } from "react";
import { toast } from "sonner";
import { BtnOutline, BtnPrimary } from "@/components/portal-shell";
import type { BlpArchivo } from "@/features/reportes/components/ReporteConciliacionesBLP";

// Modales a mano (no ModalDialog): sin header sticky ni botón de cierre, rounded-xl.
export function BlpNoRequiereModal({ archivo, onClose }: { archivo: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-md shadow-xl">
        <div className="p-6">
          <h3 className="font-display font-semibold text-lg">Análisis de conciliación</h3>
          <p className="text-sm text-muted-foreground mt-3">
            El archivo <span className="font-mono">{archivo}</span> no requiere análisis.
          </p>
          <div className="mt-5 flex justify-end">
            <BtnOutline className="h-9 text-sm px-3" onClick={onClose}>
              Cerrar
            </BtnOutline>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlpAnalisisModal({
  archivo,
  onClose,
}: {
  archivo: BlpArchivo;
  onClose: () => void;
}) {
  const [ejecutado, setEjecutado] = useState(false);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-md shadow-xl">
        <div className="p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg">Analizar conciliación</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              <span className="text-foreground font-medium">Archivo:</span>{" "}
              <span className="font-mono">{archivo.archivo}</span>
            </div>
            <div>
              <span className="text-foreground font-medium">Fecha:</span>{" "}
              <span className="font-mono">{archivo.fecha}</span>
            </div>
            <div>
              <span className="text-foreground font-medium">Estado:</span> {archivo.estado}
            </div>
          </div>
          <p className="text-sm">
            Se ejecutará el análisis de la conciliación BLP correspondiente.
          </p>
          {ejecutado && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-sm px-3 py-2">
              Análisis ejecutado correctamente.
            </div>
          )}
          <div className="flex justify-end gap-2">
            <BtnOutline className="h-9 text-sm px-3" onClick={onClose}>
              Cerrar
            </BtnOutline>
            <BtnPrimary
              className="h-9 text-sm px-3"
              onClick={() => {
                setEjecutado(true);
                toast.success("Análisis de conciliación ejecutado");
              }}
            >
              Ejecutar análisis
            </BtnPrimary>
          </div>
        </div>
      </div>
    </div>
  );
}
