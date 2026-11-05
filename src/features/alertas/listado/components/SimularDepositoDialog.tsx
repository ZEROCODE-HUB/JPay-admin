import { useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/ui/form-dialog";
import { simulateDeposit } from "@/lib/api/compliance";
import {
  inputSimulacion,
  resultadoSimulacion,
  validarSimulacion,
  type FormSimulacion,
} from "../utils";

import { monedaActiva } from "@/shared/format";
const inputCls =
  "w-full h-9 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

/** Depósito entrante de prueba: pasa por el mismo motor que un PAY-IN real. */
export function SimularDepositoDialog({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [form, setForm] = useState<FormSimulacion>({
    clabe: "",
    importe: "",
    rfc: "",
    titular: "",
    clabeOrigen: "",
  });
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    const error = validarSimulacion(form);
    if (error) {
      toast.error(error);
      return;
    }
    setEnviando(true);
    try {
      const r = await simulateDeposit(inputSimulacion(form));
      const res = resultadoSimulacion(r);
      if (res.ok) {
        toast.success(res.mensaje);
        onDone();
        onClose();
      } else {
        toast.error(res.mensaje);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <FormDialog
      open
      onClose={onClose}
      title="Simular depósito entrante"
      description="Registra un PAY-IN de prueba que pasa por las reglas de depósitos (solo desarrollo)."
      onSubmit={() => void enviar()}
      submitLabel={enviando ? "Enviando…" : "Simular"}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold mb-1.5 block">
            CLABE destino (subcuenta del cliente)
          </label>
          <input
            className={`${inputCls} font-mono`}
            value={form.clabe}
            onChange={(e) => setForm({ ...form, clabe: e.target.value })}
            placeholder="032180000118359719"
          />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1.5 block">Importe ({monedaActiva()})</label>
          <input
            className={inputCls}
            type="number"
            min={0}
            step="0.01"
            value={form.importe}
            onChange={(e) => setForm({ ...form, importe: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1.5 block">RFC del depositante</label>
          <input
            className={`${inputCls} font-mono`}
            value={form.rfc}
            onChange={(e) => setForm({ ...form, rfc: e.target.value })}
            placeholder="GODE561231GR8"
          />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1.5 block">Titular del depositante</label>
          <input
            className={inputCls}
            value={form.titular}
            onChange={(e) => setForm({ ...form, titular: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1.5 block">CLABE de origen</label>
          <input
            className={`${inputCls} font-mono`}
            value={form.clabeOrigen}
            onChange={(e) => setForm({ ...form, clabeOrigen: e.target.value })}
          />
        </div>
      </div>
    </FormDialog>
  );
}
