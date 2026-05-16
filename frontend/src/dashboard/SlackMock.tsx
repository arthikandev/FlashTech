import { Link } from "react-router-dom";

type Props = {
  embedded?: boolean;
};

export function SlackMock({ embedded = false }: Props) {
  const content = (
    <>
      {!embedded && (
        <>
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-[#E1E0CC]">
            ← Dashboard
          </Link>
          <h1 className="mt-4 font-serif text-2xl text-[#E1E0CC]">#sales-alerts</h1>
          <p className="text-sm text-gray-500">Demo step 4 — hot lead Slack mock</p>
        </>
      )}

      <div
        className={`space-y-3 rounded-xl border border-[#212121] bg-[#1a1d21] p-4 text-sm ${
          embedded ? "mt-0" : "mt-6"
        }`}
      >
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-emerald-700 text-xs font-bold text-white">
            PIQ
          </div>
          <div>
            <p className="font-semibold text-[#E1E0CC]">
              PresenceIQ Bot{" "}
              <span className="ml-1 rounded bg-[#212121] px-1 text-[10px]">APP</span>
            </p>
            <p className="mt-1 text-gray-400">
              Hot lead — Sarangan returned to Seylan Platinum pricing (intent{" "}
              <strong className="text-emerald-400">96</strong>)
            </p>
            <p className="mt-1 text-xs text-gray-600">Just now · n8n hot-lead-slack</p>
          </div>
        </div>
      </div>
    </>
  );

  if (embedded) return <div>{content}</div>;

  return (
    <div className="min-h-screen bg-black px-6 py-10">
      <div className="mx-auto max-w-md">{content}</div>
    </div>
  );
}
