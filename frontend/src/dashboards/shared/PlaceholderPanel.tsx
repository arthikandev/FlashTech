type Props = {
  title: string;
  description: string;
};

export function PlaceholderPanel({ title, description }: Props) {
  return (
    <div className="rounded-xl border border-dash-border bg-dash-surface p-6">
      <h2 className="text-sm font-semibold text-dash-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-dash-muted">{description}</p>
      <p className="mt-4 text-xs text-dash-muted">
        Live data from Convex will appear here in a future release.
      </p>
    </div>
  );
}
