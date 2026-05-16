import type { FeedEvent } from "@/lib/dashboard/feedEvents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

type Notification = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  body: string;
  time: string;
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

const PRIORITY_VARIANT = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
} as const;

type Props = {
  events?: FeedEvent[];
  signedIn?: boolean;
  hasMembership?: boolean;
};

export function NotificationsCenter({
  events = [],
  signedIn = false,
  hasMembership = false,
}: Props) {
  const items = fromFeedEvents(events);
  const liveMode = signedIn && hasMembership;

  if (items.length === 0) {
    if (liveMode) {
      return (
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyTitle>No notifications yet</EmptyTitle>
            <EmptyDescription>
              Events appear when visitors trigger intent spikes or avatar sessions.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }
    return (
      <p className="py-4 text-sm text-muted-foreground">
        Live notifications appear when visitors interact with your embed.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((n) => (
        <li key={n.id}>
          <Card>
            <CardContent className="flex flex-col gap-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{n.title}</p>
                <span className="shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
              </div>
              <Badge variant={PRIORITY_VARIANT[n.priority]} className="w-fit text-[10px]">
                {n.priority}
              </Badge>
              <p className="text-xs text-muted-foreground">{n.body}</p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
