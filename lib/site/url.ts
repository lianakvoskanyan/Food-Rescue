import "server-only";

function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return trimmed;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function isLocalhostHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

/**
 * Auth.js reads AUTH_URL for absolute redirect URLs after sign-in/out.
 * On Vercel, .env sometimes still contains http://localhost:3000 — override in production.
 */
export function ensureAuthUrlForRuntime(): void {
  const current = process.env.AUTH_URL?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (current && !(isProduction && isLocalhostHost(normalizeSiteUrl(current)))) {
    process.env.AUTH_URL = normalizeSiteUrl(current);
    return;
  }

  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate?.trim()) {
      continue;
    }
    const url = normalizeSiteUrl(candidate);
    if (!isLocalhostHost(url)) {
      process.env.AUTH_URL = url;
      return;
    }
  }

  if (current) {
    process.env.AUTH_URL = normalizeSiteUrl(current);
  }
}

export function getSiteUrl(): string {
  ensureAuthUrlForRuntime();
  return process.env.AUTH_URL?.trim() || "http://localhost:3000";
}
