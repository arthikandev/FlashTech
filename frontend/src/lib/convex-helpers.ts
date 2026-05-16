import { useMutation, useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { useEffect, useRef } from "react";
import { showError, showPromise } from "@/lib/toast";

/** Wraps useQuery — surfaces Convex errors via toast once per error message. */
export function useQueryWithToast<Args extends Record<string, unknown>, Result>(
  query: FunctionReference<"query", "public", Args, Result>,
  args: Args | "skip"
): Result | undefined {
  // Manual FunctionReference refs from api.ts are not fully typed for useQuery args.
  const result = useQuery(query, args as never);
  const lastError = useRef<string | null>(null);

  useEffect(() => {
    if (result instanceof Error) {
      const msg = result.message;
      if (lastError.current !== msg) {
        lastError.current = msg;
        showError(`Failed to load data: ${msg}`);
      }
    }
  }, [result]);

  return result instanceof Error ? undefined : result;
}

/** Returns a mutation that shows loading/success/error toasts. */
export function useMutationWithToast<Args extends Record<string, unknown>, Result>(
  mutation: FunctionReference<"mutation", "public", Args, Result>,
  messages: { loading: string; success: string; error?: string }
) {
  const mutate = useMutation(mutation);

  return async (args: Args): Promise<Result> => {
    return showPromise(mutate(args as never), {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  };
}
