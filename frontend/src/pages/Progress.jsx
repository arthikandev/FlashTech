import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getProgress } from "../api/ai.api.js";

export default function Progress() {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    getProgress().then(setAttempts);
  }, []);

  const data = attempts.map((a, i) => ({
    name: `#${i + 1}`,
    score: Math.round((a.score / a.total) * 100),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quiz progress</h1>
      {attempts.length === 0 ? (
        <p className="text-gray-500">No attempts yet.</p>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow" style={{ height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
