import type { UserRole } from "@/lib/auth/types";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      authId: string;
      profileId: string;
      role: UserRole;
      displayName: string | null;
    };
  }
}
