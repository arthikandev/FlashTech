type Point = { turn: number; score: number };

export function SentimentArcChart({ arc }: { arc: Point[] }) {
  if (!arc.length) {
    return <p className="text-xs text-gray-500">No sentiment data yet.</p>;
  }

  const max = Math.max(...arc.map((p) => p.score), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-24">
        {arc.map((p) => (
          <div key={p.turn} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-primary/80 min-h-[4px] transition-all"
              style={{ height: `${Math.max(8, (p.score / max) * 100)}%` }}
              title={`Turn ${p.turn}: ${p.score}`}
            />
            <span className="text-[9px] text-gray-600">{p.turn}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Intent arc by turn</p>
    </div>
  );
}
