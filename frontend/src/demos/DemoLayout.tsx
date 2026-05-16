import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { EmbedScript } from "../components/EmbedScript";

type Props = {
  title: string;
  subtitle: string;
  embedKey: string;
  children: ReactNode;
};

export function DemoLayout({ title, subtitle, embedKey, children }: Props) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <p className="text-slate-400 text-sm">{subtitle}</p>
        </div>
        <Link
          to="/dashboard"
          className="text-sm text-emerald-400 hover:text-emerald-300 shrink-0"
        >
          Open dashboard →
        </Link>
      </div>
      <EmbedScript embedKey={embedKey} />
      {children}
    </div>
  );
}
