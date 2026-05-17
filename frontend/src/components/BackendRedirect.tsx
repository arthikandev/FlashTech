import { Navigate } from "react-router-dom";
import { canvasPathFromStorage } from "@/lib/postAuth";

/** Redirect legacy backend dashboard links to in-app canvas. */
export function BackendRedirect() {
  return <Navigate to={canvasPathFromStorage()} replace />;
}
