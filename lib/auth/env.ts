import { isSanityWriteConfigured } from "@/lib/sanity/writeClient";

export function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET?.trim();
}

export function isAuthConfigured(): boolean {
  return Boolean(getAuthSecret());
}

export function isRegistrationConfigured(): boolean {
  return isAuthConfigured() && isSanityWriteConfigured();
}
