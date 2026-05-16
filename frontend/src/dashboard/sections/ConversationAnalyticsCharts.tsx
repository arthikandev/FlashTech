import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartData = {
  volume: { name: string; score: number }[];
  buckets: { name: string; count: number }[];
  sentiment: { turn: number; score: number }[];
  outcomes: { name: string; value: number }[];
};

const PIE_COLORS = ["#dedbc8", "#6366f1", "#22c55e", "#f59e0b"];

export default function ConversationAnalyticsCharts({
  data,
  sentimentLabel = "Sentiment analysis",
}: {
  data: ChartData;
  sentimentLabel?: string;
}) {
  const empty = (data.volume?.length ?? 0) === 0;

  if (empty) {
    return (
      <p className="text-sm text-gray-500 py-8 text-center rounded-xl border border-[#212121] glass-panel">
        Chart data appears when live sessions are detected.
      </p>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-xl border border-[#212121] glass-panel p-4 h-56">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3">
          Conversation volume
        </p>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={data.volume}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip
              contentStyle={{
                background: "#101010",
                border: "1px solid #212121",
                borderRadius: 8,
              }}
            />
            <Line type="monotone" dataKey="score" stroke="#dedbc8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-[#212121] glass-panel p-4 h-56">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3">
          Intent distribution
        </p>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={data.buckets}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip
              contentStyle={{
                background: "#101010",
                border: "1px solid #212121",
                borderRadius: 8,
              }}
            />
            <Bar dataKey="count" fill="#dedbc8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-[#212121] glass-panel p-4 h-56">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3">
          {sentimentLabel}
        </p>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={data.sentiment}>
            <XAxis dataKey="turn" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip
              contentStyle={{
                background: "#101010",
                border: "1px solid #212121",
                borderRadius: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-[#212121] glass-panel p-4 h-56">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3">
          Session attribution
        </p>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={data.outcomes}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
            >
              {data.outcomes.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#101010",
                border: "1px solid #212121",
                borderRadius: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
