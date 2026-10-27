import { Eye, FileText, Paperclip, Send, Trash2, Upload } from "lucide-react";
import { Card } from "@/components/portal-shell";
import type { Contra } from "@/lib/api/contracargos";
import { formatDateTime } from "@/shared/format";
import type { ContracargoDetalleState } from "../hooks/useContracargoDetalle";
import { tamanoKb } from "../utils";

/** Documentación adjunta del contracargo + "Enviar a PayWay". */
export function AdjuntosCard({ c, d }: { c: Contra; d: ContracargoDetalleState }) {
  const { estado, archivos, puedeGestionar, puedeBorrar, uploading, fileInputRef } = d;
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <Paperclip size={12} /> Documentación adjunta ({archivos.length})
        </h4>
        {puedeGestionar && estado === "En_mediación" && !c.enviadoPaywayAt && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 h-7 px-2 rounded-md border bg-card text-xs hover:bg-muted disabled:opacity-50"
          >
            {uploading ? (
              <span className="inline-block w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            ) : (
              <Upload size={12} />
            )}
            Adjuntar
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void d.onSubirArchivo(f);
            e.target.value = "";
          }}
        />
      </div>

      {archivos.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sin adjuntos todavía.</p>
      ) : (
        <ul className="space-y-1">
          {archivos.map((a) => (
            <li
              key={a.path}
              className="flex items-center justify-between gap-2 text-xs rounded-md border px-2 py-1.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={12} className="shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.name}</p>
                  <p className="text-muted-foreground text-[10px]">
                    {tamanoKb(a.size)} KB · {formatDateTime(a.uploaded_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => d.onVerArchivo(a.path)}
                  className="h-7 w-7 rounded-md border bg-card hover:bg-muted inline-flex items-center justify-center"
                  title="Ver"
                >
                  <Eye size={12} />
                </button>
                {puedeBorrar && !c.enviadoPaywayAt && (
                  <button
                    type="button"
                    onClick={() => d.onQuitarArchivo(a.path)}
                    className="h-7 w-7 rounded-md border border-danger-200 text-danger-600 hover:bg-danger-50 inline-flex items-center justify-center"
                    title="Quitar"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {estado === "En_mediación" && archivos.length > 0 && !c.enviadoPaywayAt && puedeGestionar && (
        <button
          type="button"
          onClick={d.onEnviarPayway}
          className="mt-3 w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-1.5"
        >
          <Send size={14} /> Enviar a PayWay
        </button>
      )}

      {estado === "En_mediación" && archivos.length === 0 && (
        <p className="text-xs text-amber-700 mt-2">
          Adjuntá al menos un comprobante antes de enviar a PayWay.
        </p>
      )}
    </Card>
  );
}
