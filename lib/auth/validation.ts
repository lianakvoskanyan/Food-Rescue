import type { UserRole } from "@/lib/auth/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterRole = Extract<UserRole, "customer" | "seller">;

export function parseRegisterRole(raw: unknown): RegisterRole {
  const value = String(raw ?? "").trim();
  if (value === "seller") {
    return "seller";
  }
  return "customer";
}

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) {
    return "Enter email";
  }
  if (!EMAIL_PATTERN.test(value)) {
    return "Invalid email";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Enter password";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
}

export function validateFullName(fullName: string): string | null {
  const value = fullName.trim();
  if (value.length > 120) {
    return "Name is too long";
  }
  return null;
}

export function sanitizeNextPath(raw: string | undefined): string {
  if (!raw) {
    return "/profile";
  }

  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/profile";
  }

  if (value.includes("\\") || value.includes("@")) {
    return "/profile";
  }

  return value;
}
