export function IntentBadge({ score }: { score?: number }) {
  if (score == null) {
    return (
      <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
        —
      </span>
    );
  }
  const color =
    score >= 80
      ? "bg-emerald-500/20 text-emerald-300"
      : score >= 50
        ? "bg-amber-500/20 text-amber-300"
        : "bg-rose-500/20 text-rose-300";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {score}
    </span>
  );
}
