import { useEffect, useState } from "react";
import { Download, Eye, ImageOff, Loader2 } from "lucide-react";
import { DOCUMENTO_LABELS, type Documento } from "@/lib/api/documentos";
import { esUrlImagen } from "../utils";

/**
 * Tarjeta de un documento del cliente (KYC). Estados de la vista previa:
 *  - `cargando`: todavía se está pidiendo el enlace firmado → «Cargando…» (no «Sin archivo»);
 *  - imagen bajando → indicador hasta que termina (`onLoad`);
 *  - si la miniatura falla, se intenta con el archivo original antes de dar error;
 *  - sin enlace: «Sin archivo» (no se subió) o «No se pudo obtener el archivo» (se subió, pero no
 *    se pudo firmar el enlace).
 */
export function DocumentoCard({
  doc,
  resolvedUrl,
  thumbUrl,
  cargando = false,
}: {
  doc: Documento;
  legajo: string;
  resolvedUrl: string | null;
  thumbUrl: string | null;
  /** Se están resolviendo los enlaces firmados de los documentos. */
  cargando?: boolean;
}) {
  const resolved = resolvedUrl;
  // Primero la miniatura; si falla, el original; si también falla, error.
  const [fase, setFase] = useState<"miniatura" | "original" | "error">("miniatura");
  const [lista, setLista] = useState(false);
  useEffect(() => {
    setFase("miniatura");
    setLista(false);
  }, [resolvedUrl, thumbUrl]);

  const src = fase === "miniatura" ? (thumbUrl ?? resolvedUrl) : resolvedUrl;
  const alFallar = () => {
    if (fase === "miniatura" && thumbUrl && thumbUrl !== resolvedUrl) {
      setFase("original");
      setLista(false);
    } else {
      setFase("error");
    }
  };

  const descargar = async () => {
    if (!resolved) return;
    const nombre = `${DOCUMENTO_LABELS[doc.tipo] ?? doc.label ?? "documento"}${
      doc.url ? "." + doc.url.split(".").pop() : ""
    }`;
    try {
      const res = await fetch(resolved);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = nombre;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(resolved, "_blank", "noreferrer");
    }
  };

  const cargandoVisual = (texto: string) => (
    <div
      role="status"
      className="flex h-full w-full animate-pulse flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground"
    >
      <Loader2 size={18} className="animate-spin" />
      <span>{texto}</span>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card p-0">
      <div className="relative h-32 w-full bg-muted">
        {cargando && !resolved ? (
          cargandoVisual("Cargando…")
        ) : !resolved ? (
          <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
            {doc.url ? "No se pudo obtener el archivo" : "Sin archivo"}
          </div>
        ) : fase === "error" ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center text-xs text-muted-foreground">
            <ImageOff size={18} />
            <span>No se pudo cargar</span>
            <a
              href={resolved}
              target="_blank"
              rel="noreferrer"
              className="break-all text-primary-ink underline"
            >
              Abrir enlace
            </a>
          </div>
        ) : esUrlImagen(resolved) ? (
          <>
            {!lista && <div className="absolute inset-0">{cargandoVisual("Cargando imagen…")}</div>}
            <img
              key={src ?? "sin-src"}
              src={src ?? undefined}
              alt={doc.label}
              className={`h-full w-full object-cover transition-opacity duration-200 ${
                lista ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setLista(true)}
              onError={alFallar}
            />
          </>
        ) : (
          <a
            href={resolved}
            target="_blank"
            rel="noreferrer"
            className="flex h-full w-full items-center justify-center gap-2 px-2 text-center text-sm font-medium text-primary-ink"
          >
            <Download size={16} /> Ver / descargar
          </a>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <p className="text-sm font-semibold">
          {DOCUMENTO_LABELS[doc.tipo] ?? doc.label ?? "Documento"}
        </p>
        <div className="flex items-center gap-1">
          <a
            href={resolved ?? undefined}
            target="_blank"
            rel="noreferrer"
            title="Ver documento"
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md border border-input text-muted-foreground transition hover:bg-accent hover:text-foreground ${
              resolved ? "" : "pointer-events-none opacity-40"
            }`}
            aria-disabled={!resolved}
            onClick={(e) => {
              if (!resolved) e.preventDefault();
            }}
          >
            <Eye size={14} />
          </a>
          <button
            type="button"
            title="Descargar documento"
            onClick={descargar}
            disabled={!resolved}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40"
          >
            <Download size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
