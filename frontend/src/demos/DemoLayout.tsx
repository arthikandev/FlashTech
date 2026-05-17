import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { AvatarBoot } from "@/components/AvatarBoot";
import { BeyondPresenceFrame } from "@/components/BeyondPresenceFrame";
import { DemoAvatarStatus } from "@/components/DemoAvatarStatus";
import { EmbedScript } from "@/components/EmbedScript";
import { api } from "@/convex/api";
import type { Business } from "@/convex/types";
import { resolveBpAgentId } from "@/hooks/useBpAgentId";

type Props = {
  /** Shown above the title (defaults to “Enterprise demo”). */
  industryLabel?: string;
  title: string;
  subtitle: string;
  embedKey: string;
  children: ReactNode;
};

export function DemoLayout({
  industryLabel = "Enterprise demo",
  title,
  subtitle,
  embedKey,
  children,
}: Props) {
  const business = useQuery(api.businesses.getByEmbedKey, { embedKey }) as
    | Business
    | null
    | undefined;
  const bpAgentId = resolveBpAgentId(business);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-primary text-xs uppercase tracking-widest">{industryLabel}</p>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#E1E0CC] mt-1">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            to={`/canvas?embedKey=${encodeURIComponent(embedKey)}`}
            className="text-primary hover:underline"
          >
            Open workspace →
          </Link>
          <Link to="/present" className="text-gray-500 hover:text-[#E1E0CC]">
            Presenter view
          </Link>
        </div>
      </div>

      <EmbedScript embedKey={embedKey} />

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">{children}</div>

        <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="rounded-xl border border-[#212121] bg-[#101010] p-4">
            <p className="text-xs uppercase tracking-wide text-primary mb-1">
              Beyond Presence · Live
            </p>
            <p className="text-sm text-gray-500 mb-3">
              Talk to your AI advisor — intent-scored and personalised for this visitor.
            </p>
            <DemoAvatarStatus />
            <BeyondPresenceFrame agentId={bpAgentId} height={520} className="mt-3" />
          </div>
        </aside>
      </div>

      {/* Pipeline SDK runs in background; visible avatar is BeyondPresenceFrame above */}
      <div className="sr-only" aria-hidden>
        <AvatarBoot embedKey={embedKey} />
      </div>
    </div>
  );
}
