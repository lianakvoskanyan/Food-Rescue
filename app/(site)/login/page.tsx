import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthConfigNotice } from "@/components/auth/auth-config-notice";
import { LoginForm } from "@/components/auth/login-form";
import { Container } from "@/components/ui/container";
import { isAuthConfigured } from "@/lib/auth/env";
import { getCurrentAuthState } from "@/lib/auth/session";
import { sanitizeNextPath } from "@/lib/auth/validation";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function isStudioPath(path: string | undefined): boolean {
  if (!path) {
    return false;
  }
  return path === "/studio" || path.startsWith("/studio/");
}

async function LoginPageContent({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);

  const auth = await getCurrentAuthState();
  if (auth) {
    if (isStudioPath(nextPath)) {
      if (auth.profile.role === "admin") {
        redirect(nextPath ?? "/studio");
      }
      redirect("/profile?error=access_denied");
    }
    redirect(nextPath ?? "/profile");
  }

  if (!isAuthConfigured()) {
    return <AuthConfigNotice />;
  }

  return <LoginForm nextPath={nextPath} />;
}

function LoginFallback() {
  return <div className="h-64 animate-pulse rounded-2xl bg-brand/10" />;
}

export default function LoginPage(props: LoginPageProps) {
  return (
    <main className="flex-1 py-12 sm:py-16">
      <Container className="max-w-md">
        <h1 className="font-display text-3xl font-semibold text-brand-dark">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Email and password. Seller and admin roles are assigned in Sanity Studio.
        </p>
        <div className="mt-8">
          <Suspense fallback={<LoginFallback />}>
            <LoginPageContent searchParams={props.searchParams} />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}
