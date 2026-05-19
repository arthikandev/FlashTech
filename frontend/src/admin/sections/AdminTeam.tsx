import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { Trash2, UserPlus, X } from "lucide-react";
import { api } from "@/convex/api";
import { useTenant } from "@/tenant/TenantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Role = "admin" | "viewer";

export function AdminTeam() {
  const { businessId } = useTenant();
  const { user } = useUser();
  const myClerkId = user?.id;

  const members = useQuery(
    api.businessMembers.listByBusiness,
    businessId ? { businessId: businessId as unknown as string } : "skip"
  );
  const invites = useQuery(
    api.businessMembers.listPendingInvites,
    businessId ? { businessId: businessId as unknown as string } : "skip"
  );

  const inviteMember = useMutation(api.businessMembers.inviteMember);
  const revokeInvite = useMutation(api.businessMembers.revokeInvite);
  const updateRole = useMutation(api.businessMembers.updateRole);
  const removeMember = useMutation(api.businessMembers.removeMember);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId || !email.trim()) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      await inviteMember({
        businessId: businessId as unknown as string,
        email: email.trim(),
        role,
      });
      setEmail("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRoleChange(membershipId: string, next: Role) {
    if (!businessId) return;
    setErrorMsg(null);
    try {
      await updateRole({
        businessId: businessId as unknown as string,
        membershipId,
        role: next,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleRemove(membershipId: string) {
    if (!businessId) return;
    if (!window.confirm("Remove this member from the workspace?")) return;
    setErrorMsg(null);
    try {
      await removeMember({
        businessId: businessId as unknown as string,
        membershipId,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleRevokeInvite(inviteId: string) {
    if (!businessId) return;
    setErrorMsg(null);
    try {
      await revokeInvite({
        businessId: businessId as unknown as string,
        inviteId,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="space-y-4">
      {errorMsg ? (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
          {errorMsg}
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Invite a teammate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={handleInvite}
          >
            <div className="min-w-[200px] flex-1">
              <label
                htmlFor="invite-email"
                className="block text-xs font-medium text-muted-foreground"
              >
                Email
              </label>
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="invite-role"
                className="block text-xs font-medium text-muted-foreground"
              >
                Role
              </label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <UserPlus className="size-4" /> Invite
            </button>
          </form>
          <p className="mt-2 text-[11px] text-muted-foreground">
            The invite is auto-accepted when that email signs in via Clerk.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Members</CardTitle>
        </CardHeader>
        <CardContent>
          {!members ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {members.map((m) => {
                const isSelf = m.clerkUserId === myClerkId;
                return (
                  <li
                    key={m._id}
                    className="flex flex-wrap items-center justify-between gap-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {m.invitedEmail ?? m.clerkUserId}
                        {isSelf ? (
                          <span className="ml-2 text-[11px] text-muted-foreground">
                            (you)
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Joined {new Date(m.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={m.role}
                        onChange={(e) =>
                          handleRoleChange(m._id, e.target.value as Role)
                        }
                        disabled={isSelf}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs disabled:opacity-50"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemove(m._id)}
                        disabled={isSelf}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-rose-700 hover:bg-muted disabled:opacity-50 dark:text-rose-300"
                      >
                        <Trash2 className="size-3" /> Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Pending invites
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!invites ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending invites.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {invites.map((inv) => (
                <li
                  key={inv._id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {inv.email}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Invited {new Date(inv.createdAt).toLocaleString()} ·{" "}
                      {inv.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRevokeInvite(inv._id)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
                  >
                    <X className="size-3" /> Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
