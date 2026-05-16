import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  children: ReactNode;
  maxWidth?: "md" | "lg" | "xl" | "full";
};

const widths = {
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-[1400px]",
};

export function PageShell({
  title,
  subtitle,
  backTo = "/",
  backLabel = "← Home",
  children,
  maxWidth = "lg",
}: Props) {
  return (
    <div className="min-h-screen bg-black px-4 sm:px-6 py-10">
      <div className={`mx-auto ${widths[maxWidth]}`}>
        <Link to={backTo} className="text-sm text-gray-500 hover:text-[#E1E0CC] transition-colors">
          {backLabel}
        </Link>
        <p className="text-primary text-xs uppercase tracking-widest mt-6">PresenceIQ</p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-[#E1E0CC]">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-gray-500 max-w-2xl">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
