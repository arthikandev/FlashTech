import { Link } from "react-router-dom";

export function SlackMock() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto max-w-md">
        <Link to="/" className="text-sm text-slate-400 hover:text-white">
          ← Dashboard
        </Link>
        <h1 className="mt-4 font-display text-2xl text-white">#sales-alerts</h1>
        <p className="text-sm text-slate-500">Demo step 4 — hot lead Slack mock</p>

        <div className="mt-6 space-y-3 rounded-lg border border-slate-800 bg-[#1a1d21] p-4 font-sans text-sm">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-emerald-700 text-xs font-bold text-white">
              PIQ
            </div>
            <div>
              <p className="font-semibold text-white">
                PresenceIQ Bot{" "}
                <span className="ml-1 rounded bg-slate-700 px-1 text-[10px]">APP</span>
              </p>
              <p className="mt-1 text-slate-300">
                🔥 <strong>Hot lead</strong> — Sarangan returned to Seylan Platinum pricing
                (intent <strong>92</strong>)
              </p>
              <p className="mt-1 text-xs text-slate-500">Just now · n8n hot-lead-slack</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
