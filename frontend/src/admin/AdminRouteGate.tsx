import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { useTenant } from "@/tenant/TenantContext";

type Props = {
  readonly children: ReactNode;
};

export function AdminRouteGate({ children }: Props) {
  const { role, hasMembershipForEmbed, authReady } = useTenant();

  if (!authReady) {
    return (
      <div className="flex h-full items-center justify-center px-6 py-12 text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  if (!hasMembershipForEmbed || role !== "admin") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <ShieldAlert className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="text-base font-semibold">Admin access required</h2>
        <p className="text-sm text-muted-foreground">
          You're signed in as a viewer for this workspace. Ask an admin to
          upgrade your role to manage team, billing, and integrations.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
