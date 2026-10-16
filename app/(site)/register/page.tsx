import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthConfigNotice } from "@/components/auth/auth-config-notice";
import { RegisterForm } from "@/components/auth/register-form";
import { Container } from "@/components/ui/container";
import { isAuthConfigured } from "@/lib/auth/env";
import { getCurrentAuthState } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Register",
};

async function RegisterPageContent() {
  const auth = await getCurrentAuthState();
  if (auth) {
    redirect("/profile");
  }

  if (!isAuthConfigured()) {
    return <AuthConfigNotice />;
  }

  return <RegisterForm />;
}

function RegisterFallback() {
  return <div className="h-72 animate-pulse rounded-2xl bg-brand/10" />;
}

export default function RegisterPage() {
  return (
    <main className="flex-1 py-12 sm:py-16">
      <Container className="max-w-md">
        <h1 className="font-display text-3xl font-semibold text-brand-dark">
          Register
        </h1>
        <p className="mt-2 text-sm text-muted">
          Choose account type: customer or seller. Administrators are assigned only by the
          project team in Sanity Studio.
        </p>
        <div className="mt-8">
          <Suspense fallback={<RegisterFallback />}>
            <RegisterPageContent />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}
