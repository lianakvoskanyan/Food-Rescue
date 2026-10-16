import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/lib/auth/types";

type AuthTokenUser = {
  id?: string;
  authId?: string;
  profileId?: string;
  role?: UserRole;
  displayName?: string | null;
};

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const credentialsUser = user as AuthTokenUser;
        if (credentialsUser.id) {
          token.sub = credentialsUser.id;
        }
        if (credentialsUser.authId) {
          token.authId = credentialsUser.authId;
        }
        if (credentialsUser.profileId) {
          token.profileId = credentialsUser.profileId;
        }
        if (credentialsUser.role) {
          token.role = credentialsUser.role;
        }
        if (credentialsUser.displayName !== undefined) {
          token.displayName = credentialsUser.displayName;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.authId =
          typeof token.authId === "string" ? token.authId : "";
        session.user.profileId =
          typeof token.profileId === "string" ? token.profileId : "";
        session.user.role =
          token.role === "seller" || token.role === "admin"
            ? token.role
            : "customer";
        session.user.displayName =
          typeof token.displayName === "string" ? token.displayName : null;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
