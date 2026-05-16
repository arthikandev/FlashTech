import { toast } from "sonner";

export function showSuccess(message: string) {
  toast.success(message);
}

export function showError(message: string, action?: { label: string; onClick: () => void }) {
  if (action) {
    toast.error(message, { action });
  } else {
    toast.error(message);
  }
}

export function showLoading(message: string): () => void {
  const id = toast.loading(message);
  return () => toast.dismiss(id);
}

export function showInfo(message: string) {
  toast.info(message);
}

type PromiseToastResult<T> = T | { unwrap: () => Promise<T> };

export async function showPromise<T>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error?: string }
): Promise<T> {
  const result = toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error ?? "Something went wrong",
  }) as PromiseToastResult<T>;

  if (result && typeof result === "object" && "unwrap" in result) {
    return result.unwrap();
  }
  return result as T;
}
