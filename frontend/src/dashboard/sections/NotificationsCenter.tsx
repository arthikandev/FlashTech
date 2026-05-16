import type { FeedEvent } from "../hooks/useAiFeedEvents";

type Notification = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  body: string;
  time: string;
};

const MOCK: Notification[] = [
  {
    id: "mock-1",
    priority: "high",
    title: "Hot lead detected",
    body: "Intent score crossed 80 for an enterprise visitor.",
    time: "Just now",
  },
  {
    id: "mock-2",
    priority: "medium",
    title: "Returning customer online",
    body: "CRM match found — personalised opener deployed.",
    time: "2m ago",
  },
  {
    id: "mock-3",
    priority: "low",
    title: "Weekly analytics ready",
    body: "Your pipeline summary is available to export.",
    time: "1h ago",
  },
];

const PRIORITY_STYLES = {
  high: "border-rose-500/40 bg-rose-950/20",
  medium: "border-amber-500/30 bg-amber-950/15",
  low: "border-[#212121] bg-[#101010]",
};

function tagToPriority(tag: FeedEvent["tag"], message: string): Notification["priority"] {
  if (tag === "AI" && message.includes("/100")) return "high";
  if (tag === "CRM") return "medium";
  return "low";
}

function tagToTitle(tag: FeedEvent["tag"]): string {
  switch (tag) {
    case "AI":
      return "Intent alert";
    case "CRM":
      return "CRM activity";
    case "Avatar":
      return "Avatar session";
    case "Sales":
      return "Sales recommendation";
    default:
      return "Update";
  }
}

function formatTime(at: number): string {
  const diff = Date.now() - at;
  if (diff < 60_000) return "Just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3600_000)}h ago`;
}

function fromFeedEvents(events: FeedEvent[]): Notification[] {
  return events.slice(0, 8).map((e) => ({
    id: e.id,
    priority: tagToPriority(e.tag, e.message),
    title: tagToTitle(e.tag),
    body: e.message,
    time: formatTime(e.at),
  }));
}

type Props = {
  events?: FeedEvent[];
};

export function NotificationsCenter({ events = [] }: Props) {
  const items = events.length > 0 ? fromFeedEvents(events) : MOCK;

  return (
    <ul className="space-y-3">
      {items.map((n) => (
        <li
          key={n.id}
          className={`rounded-xl border p-4 ${PRIORITY_STYLES[n.priority]}`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-[#E1E0CC]">{n.title}</p>
            <span className="text-[10px] text-gray-600 shrink-0">{n.time}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">{n.body}</p>
        </li>
      ))}
    </ul>
  );
}
