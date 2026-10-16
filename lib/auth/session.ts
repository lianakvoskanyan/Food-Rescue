import "server-only";

import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAuthConfigured } from "@/lib/auth/env";
import { fetchUserProfileByAuthId } from "@/lib/auth/sanity-profile";
import type { AuthState, UserRole } from "./types";

export class AuthConfigurationError extends Error {
  constructor() {
    super("Auth.js is not configured");
    this.name = "AuthConfigurationError";
  }
}

export function assertAuthConfigured(): void {
  if (!isAuthConfigured()) {
    throw new AuthConfigurationError();
  }
}

export async function getCurrentAuthState(): Promise<AuthState | null> {
  await connection();

  if (!isAuthConfigured()) {
    return null;
  }

  const session = await auth();
  const user = session?.user;
  if (!user?.authId || !user.email) {
    return null;
  }

  const profile =
    (await fetchUserProfileByAuthId(user.authId)) ??
    ({
      id: user.profileId,
      authId: user.authId,
      email: user.email,
      displayName: user.displayName ?? null,
      role: user.role,
    } satisfies AuthState["profile"]);

  return {
    userId: user.id,
    email: user.email,
    profile,
  };
}

export async function requireAuth(nextPath?: string): Promise<AuthState> {
  const authState = await getCurrentAuthState();
  if (authState) {
    return authState;
  }

  const query = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
  redirect(`/login${query}`);
}

export async function requireRole(
  allowedRoles: UserRole[],
  nextPath?: string,
): Promise<AuthState> {
  const authState = await requireAuth(nextPath);

  if (!allowedRoles.includes(authState.profile.role)) {
    redirect("/profile?error=access_denied");
  }

  return authState;
}
