import {
  ArrowRight,
  Building2,
  Code2,
  LayoutDashboard,
  Palmtree,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { EmbedScript } from "../components/EmbedScript";
import { cn } from "@/lib/utils";

const demoNav = [
  { to: "/demos/seylan", label: "Seylan", icon: Building2 },
  { to: "/demos/cloudmetrics", label: "CloudMetrics", icon: TrendingUp },
  { to: "/demos/coral", label: "Coral", icon: Palmtree },
] as const;

type Props = {
  title: string;
  subtitle: string;
  embedKey: string;
  industryLabel: string;
  children: ReactNode;
};

export function DemoLayout({
  title,
  subtitle,
  embedKey,
  industryLabel,
  children,
}: Props) {
  const { pathname } = useLocation();

  return (
    <div className="space-y-8 md:space-y-10">
      <PageHeader label={industryLabel} title={title} description={subtitle} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border bg-card px-4 md:px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-border bg-card-elevated text-primary">
            <Code2 className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary">Embed active</p>
            <code className="text-xs text-foreground/90 font-mono mt-0.5 block">{embedKey}</code>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {demoNav.map((d) => {
            const Icon = d.icon;
            return (
              <Link
                key={d.to}
                to={d.to}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border transition-colors",
                  pathname === d.to
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-card-elevated/60"
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {d.label}
              </Link>
            );
          })}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary text-[var(--primary-foreground)] pl-4 pr-1 py-1 hover:gap-2 transition-all"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
            <span className="flex items-center justify-center bg-foreground w-7 h-7 ml-0.5">
              <ArrowRight className="w-3.5 h-3.5 text-background" />
            </span>
          </Link>
        </div>
      </div>

      <div className="border border-border bg-card p-6 md:p-8 overflow-hidden">
        <EmbedScript embedKey={embedKey} />
        {children}
      </div>
    </div>
  );
}
