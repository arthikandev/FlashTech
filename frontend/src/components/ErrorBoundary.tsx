import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

type Props = { children: ReactNode; fallbackTitle?: string };
type State = { error: Error | null };

function isConvexUnauthorized(message: string): boolean {
  return (
    message.includes("Unauthorized") &&
    (message.includes("[CONVEX") || message.includes("requireIdentity"))
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      const message = this.state.error.message || "An unexpected error occurred.";
      const authError = isConvexUnauthorized(message);

      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-black px-6 py-16 text-center">
          <h1 className="text-xl font-semibold text-[#E1E0CC]">
            {authError
              ? "Session not connected"
              : (this.props.fallbackTitle ?? "Something went wrong")}
          </h1>
          <p className="max-w-md text-sm text-gray-500">
            {authError ? (
              <>
                Your sign-in could not be verified with the database. Sign out and sign in again,
                or check that Clerk and Convex are configured (see backend/SETUP.md).
              </>
            ) : (
              message
            )}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {authError && (
              <Button render={<Link to="/login" />} variant="outline">
                Sign in again
              </Button>
            )}
            <Button
              variant="default"
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
            >
              Reload page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
