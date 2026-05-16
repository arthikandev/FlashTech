import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { CategorySelectPage } from "./CategorySelectPage";

export function ClientSignupRoute() {
  return (
    <>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
      <SignedIn>
        <CategorySelectPage />
      </SignedIn>
    </>
  );
}
