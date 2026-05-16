type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function KpiCard({ label, value, hint }: Props) {
  return (
    <div className="rounded-xl border border-dash-border bg-dash-surface px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-dash-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-dash-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-dash-muted">{hint}</p> : null}
    </div>
  );
}
