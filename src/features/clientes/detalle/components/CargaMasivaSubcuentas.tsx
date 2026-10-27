import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import { createSubcuenta, type SubcuentaInput, type SubcuentaTipo } from "@/lib/api/subcuentas";

export function CargaMasivaSubcuentas({
  open,
  legajo,
  onClose,
  onDone,
}: {
  open: boolean;
  legajo: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [, setArchivo] = useState<File | null>(null);
  const [vista, setVista] = useState<SubcuentaInput[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const parseCSV = (text: string): SubcuentaInput[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];
    const header = lines[0].toLowerCase();
    const hasHeader = /nombre|email/.test(header);
    const data = hasHeader ? lines.slice(1) : lines;
    return data.map((l) => {
      const cols = l.split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, ""));
      const [nombre, apellido = "", email, cbu = "", tipo = "Operativa"] = cols;
      return {
        nombre,
        apellido,
        email,
        cbu: cbu || undefined,
        tipo: (tipo as SubcuentaTipo) || "Operativa",
      };
    });
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setArchivo(f);
    setErr(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setVista(parseCSV(String(reader.result)));
      } catch {
        setErr("No se pudo leer el archivo CSV.");
      }
    };
    reader.readAsText(f);
  };

  const guardar = async () => {
    if (vista.length === 0) {
      setErr("El CSV no contiene filas válidas (se espera nombre, email, ...).");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      for (const row of vista) {
        if (!row.nombre.trim() || !row.email.trim()) continue;
        await createSubcuenta(legajo, row);
      }
      await queryClient.invalidateQueries({ queryKey: ["subcuentas", legajo] });
      onDone();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalDialog open={open} onClose={onClose} title="Carga masiva de subcuentas" size="lg">
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Columnas esperadas: <code>nombre, apellido, email, cbu, tipo</code>. La primera fila puede
          ser el encabezado.
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={onFile}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
        />
        {vista.length > 0 && (
          <p className="text-xs text-muted-foreground">{vista.length} fila(s) detectada(s).</p>
        )}
        {err && <p className="text-sm text-danger-600">{err}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-input px-3 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={saving || vista.length === 0}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Importando…" : "Importar"}
          </button>
        </div>
      </div>
    </ModalDialog>
  );
}
