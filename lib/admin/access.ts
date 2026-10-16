import "server-only";

import { requireRole } from "@/lib/auth/session";
import type { AuthState } from "@/lib/auth/types";

export async function requireAdminDashboard(
  nextPath: string,
): Promise<AuthState> {
  return requireRole(["admin"], nextPath);
}
