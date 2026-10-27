export function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "default" | "muted";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold tabular-nums ${
          tone === "muted" ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
