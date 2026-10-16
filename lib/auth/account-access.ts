import "server-only";

import { redirect } from "next/navigation";
import { getCurrentAuthState } from "@/lib/auth/session";
import type { AuthState } from "@/lib/auth/types";

export async function requireCustomerAccount(
  nextPath = "/account",
): Promise<AuthState> {
  const auth = await getCurrentAuthState();

  if (!auth) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (auth.profile.role === "seller") {
    redirect("/seller");
  }

  if (auth.profile.role === "admin") {
    redirect("/admin");
  }

  return auth;
}
