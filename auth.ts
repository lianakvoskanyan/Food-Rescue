import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { verifyUserCredentials } from "@/lib/auth/sanity-profile";
import type { UserRole } from "@/lib/auth/types";

type CredentialsUser = {
  id: string;
  email: string;
  name: string | null;
  authId: string;
  profileId: string;
  role: UserRole;
  displayName: string | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "");
        const password = String(credentials?.password ?? "");
        if (!email || !password) {
          return null;
        }

        const profile = await verifyUserCredentials(email, password);
        if (!profile) {
          return null;
        }

        const user: CredentialsUser = {
          id: profile.authId,
          email: profile.email,
          name: profile.displayName,
          authId: profile.authId,
          profileId: profile.id,
          role: profile.role,
          displayName: profile.displayName,
        };

        return user;
      },
    }),
  ],
});
