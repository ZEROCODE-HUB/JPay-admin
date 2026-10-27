import { useQuery } from "@tanstack/react-query";
import { listDocumentos } from "@/lib/api/documentos";
import { useDocumentosUrls } from "@/lib/api/use-documento-url";
import { DocumentoCard } from "./DocumentoCard";
import { Seccion } from "./Seccion";

export function DocumentosTab({ legajo }: { legajo: string }) {
  const query = useQuery({
    queryKey: ["documentos", legajo],
    queryFn: () => listDocumentos(legajo),
    enabled: !!legajo,
  });

  const documentos = query.data ?? [];
  const { urls, thumbs } = useDocumentosUrls(documentos, legajo);

  return (
    <Seccion
      titulo="Documentos"
      loading={query.isLoading}
      error={query.isError ? query.error : null}
      onRetry={() => query.refetch()}
      vacio={!query.isLoading && documentos.length === 0}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {documentos.map((doc) => (
          <DocumentoCard
            key={doc.id}
            doc={doc}
            legajo={legajo}
            resolvedUrl={urls[doc.id] ?? null}
            thumbUrl={thumbs[doc.id] ?? null}
          />
        ))}
      </div>
    </Seccion>
  );
}
