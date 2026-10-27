export function MiniDashboard<T>({
  titulo,
  columnas,
  datos,
  vacio = "Sin registros.",
}: {
  titulo: string;
  columnas: { label: string; render: (r: T) => React.ReactNode }[];
  datos: T[];
  vacio?: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </h4>
      {datos.length === 0 ? (
        <p className="text-xs text-muted-foreground">{vacio}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left uppercase tracking-wide text-muted-foreground">
                {columnas.map((c, i) => (
                  <th key={i} className="px-2 py-1.5 font-medium">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datos.map((d, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  {columnas.map((c, j) => (
                    <td key={j} className="px-2 py-1.5 text-foreground">
                      {c.render(d)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
