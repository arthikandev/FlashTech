import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = QueryCtx | MutationCtx;

export async function requireIdentity(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity;
}

export async function requireBusinessMember(
  ctx: AuthCtx,
  businessId: Id<"businesses">
) {
  const identity = await requireIdentity(ctx);
  const membership = await ctx.db
    .query("businessMembers")
    .withIndex("by_user_and_business", (q) =>
      q.eq("clerkUserId", identity.subject).eq("businessId", businessId)
    )
    .unique();

  if (!membership) {
    throw new Error("Forbidden");
  }

  return { identity, membership };
}
