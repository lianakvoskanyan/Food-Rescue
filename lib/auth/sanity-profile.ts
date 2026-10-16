import "server-only";

import {
  isSanityWriteConfigured,
  sanityWriteClient,
} from "@/lib/sanity/writeClient";
import { sanityServerClient } from "@/lib/sanity/serverClient";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { RegisterRole } from "@/lib/auth/validation";
import type { UserProfile, UserRole } from "./types";

const profileFields = /* groq */ `
  _id,
  authId,
  email,
  displayName,
  role
`;

export const userProfileByAuthIdQuery = /* groq */ `
  *[_type == "userProfile" && authId == $authId][0] {
    ${profileFields}
  }
`;

const userProfileByEmailQuery = /* groq */ `
  *[_type == "userProfile" && email == $email][0] {
    _id,
    authId,
    email,
    displayName,
    role,
    passwordHash
  }
`;

type SanityUserProfileRow = {
  _id: string;
  authId: string;
  email: string;
  displayName: string | null;
  role: UserRole;
};

type SanityUserProfileWithPassword = SanityUserProfileRow & {
  passwordHash?: string | null;
};

function mapProfile(row: SanityUserProfileRow): UserProfile {
  return {
    id: row._id,
    authId: row.authId,
    email: row.email,
    displayName: row.displayName,
    role: row.role,
  };
}

export function buildEmailAuthId(email: string): string {
  return `email:${email.trim().toLowerCase()}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function fetchUserProfileByAuthId(
  authId: string,
): Promise<UserProfile | null> {
  const row = await sanityServerClient.fetch<SanityUserProfileRow | null>(
    userProfileByAuthIdQuery,
    { authId },
  );

  return row ? mapProfile(row) : null;
}

async function fetchUserProfileByEmail(
  email: string,
): Promise<SanityUserProfileWithPassword | null> {
  return sanityServerClient.fetch<SanityUserProfileWithPassword | null>(
    userProfileByEmailQuery,
    { email: normalizeEmail(email) },
  );
}

export async function verifyUserCredentials(
  email: string,
  password: string,
): Promise<UserProfile | null> {
  const row = await fetchUserProfileByEmail(email);
  if (!row?.passwordHash) {
    return null;
  }

  const valid = await verifyPassword(password, row.passwordHash);
  return valid ? mapProfile(row) : null;
}

export type RegisterUserInput = {
  email: string;
  password: string;
  displayName?: string | null;
  role: RegisterRole;
};

export async function registerUser(input: RegisterUserInput): Promise<UserProfile> {
  if (!isSanityWriteConfigured()) {
    throw new Error(
      "SANITY_API_WRITE_TOKEN is required to register new users.",
    );
  }

  const email = normalizeEmail(input.email);
  const existing = await fetchUserProfileByEmail(email);
  if (existing) {
    throw new Error("EMAIL_TAKEN");
  }

  const passwordHash = await hashPassword(input.password);
  const authId = buildEmailAuthId(email);

  const created = await sanityWriteClient.create({
    _type: "userProfile",
    authId,
    email,
    displayName: input.displayName?.trim() || null,
    role: input.role === "seller" ? "seller" : "customer",
    passwordHash,
  });

  return mapProfile(created as SanityUserProfileRow);
}

export async function updateUserDisplayName(
  profileId: string,
  displayName: string | null,
): Promise<void> {
  if (!isSanityWriteConfigured()) {
    throw new Error("SANITY_API_WRITE_TOKEN is required to update profiles.");
  }

  await sanityWriteClient.patch(profileId).set({ displayName }).commit();
}
