export default function ScoreDisplay({ score, total }) {
  const pct = total ? Math.round((score / total) * 100) : 0;
  const emoji = pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "📚";
  return (
    <div className="text-center py-6">
      <div className="text-5xl">{emoji}</div>
      <div className="text-3xl font-bold mt-2">
        {score} / {total}
      </div>
      <div className="text-gray-500">{pct}%</div>
    </div>
  );
}
