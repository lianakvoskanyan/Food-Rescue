import "server-only";

import { requireRole } from "@/lib/auth/session";
import type { AuthState } from "@/lib/auth/types";
import { SellerServiceError } from "@/lib/seller/errors";

export async function requireSellerDashboard(
  nextPath: string,
): Promise<AuthState> {
  return requireRole(["seller", "admin"], nextPath);
}

export function assertSellerCanMutate(auth: AuthState): void {
  if (auth.profile.role !== "seller") {
    throw new SellerServiceError(
      "Only users with the seller role can edit the store and offers.",
    );
  }
}
